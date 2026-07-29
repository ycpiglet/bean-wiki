// One account surface for the application OAuth session and the Sites-provided
// identity. GitHub remains the source of truth for document edit attribution;
// D1 stores learning/community activity against the unified account key.
import type { Metadata } from "next";
import Link from "next/link";
import { BeanMark } from "@/components/bean-logo";
import { PrimaryNav } from "@/components/primary-nav";
import { AccountMenu } from "@/components/account-menu";
import { CredentialPanel } from "@/components/credential-panel";
import { ExpertiseBadges } from "@/components/expertise-badges";
import { HeaderSearchButton } from "@/components/header-search-button";
import { LearningDashboard } from "@/components/learning-dashboard";
import { MobileNav } from "@/components/mobile-nav";
import { ProfileForm } from "@/components/profile-form";
import { SkillAssessment } from "@/components/skill-assessment";
import { ThemeToggle } from "@/components/theme-toggle";
import { isAdminUser } from "@/lib/admin";
import { devAuthConfigured } from "@/lib/dev-auth";
import {
  getRepoConfig,
  ghCanPush,
  ghCommitsByAuthor,
  ghProposalsFor,
} from "@/lib/github";
import { googleConfigured, oauthConfigured, safeReturnTo } from "@/lib/oauth";
import { getPlatformUser, platformSignOutPath } from "@/lib/platform-auth";
import {
  getOrCreateProfile,
  listCredentials,
  profileStoreConfigured,
  type Credential,
  type Profile,
} from "@/lib/profile-store";
import { readSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "계정 관리",
  description: "Bean Wiki 계정, GitHub 연동과 편집 권한, 기여 내역을 확인합니다.",
  robots: { index: false, follow: false },
};

function initial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, "0")}. ${String(d.getDate()).padStart(2, "0")}.`;
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string | string[] }>;
}) {
  const query = await searchParams;
  const requestedReturnTo = Array.isArray(query.returnTo)
    ? query.returnTo[0]
    : query.returnTo;
  const returnTo = requestedReturnTo
    ? safeReturnTo(requestedReturnTo)
    : "/account";
  const session = await readSession();
  const user = await getPlatformUser(session);
  const { owner, repo } = getRepoConfig();

  const github = session?.github ?? null;
  const canPush = github ? await ghCanPush(github.token) : false;
  const [commits, proposals] = github
    ? await Promise.all([
        ghCommitsByAuthor(github.login, github.token),
        ghProposalsFor(github.login, github.token),
      ])
    : [[], []];

  // Profile, skill tier and credentials live in Supabase. A store outage or a
  // deployment without credentials must not take the whole account page down,
  // so failures degrade to the identity-only view.
  const storeReady = profileStoreConfigured();
  let profile: Profile | null = null;
  let credentials: Credential[] = [];
  let storeError: string | null = null;
  if (user && storeReady) {
    try {
      profile = await getOrCreateProfile(user);
      credentials = await listCredentials(user.accountKey);
    } catch (error) {
      storeError = error instanceof Error ? error.message : "profile store unavailable";
    }
  }
  const admin = isAdminUser(user, profile);

  return (
    <main className="article-page">
      <header className="article-header shell">
        <Link href="/" className="brand" aria-label="Bean Wiki 홈">
          <BeanMark compact />
          <span>BEAN</span>
          <em>WIKI</em>
        </Link>
        <PrimaryNav />
        <div className="header-tools">
          <Link href="/" className="back-link">← 홈으로</Link>
          <HeaderSearchButton locale="ko" />
          <ThemeToggle />
          <AccountMenu locale="ko" />
          <MobileNav />
        </div>
      </header>

      <div className="shell acct">
        <header className="acct-head">
          <span className="eyebrow">ACCOUNT</span>
          <h1>계정 관리</h1>
          <p>
            읽기는 로그인 없이도 열려 있습니다. 계정은 신원을 확인하는 층이고,
            문서를 고칠 권한은 GitHub를 연동해야 생깁니다.
          </p>
        </header>

        {!user ? (
          <section className="acct-card acct-empty">
            <h2>로그인이 필요합니다</h2>
            <p>
              로그인하면 학습 경험치와 커뮤니티 활동, 편집 권한 상태를 한곳에서
              관리할 수 있습니다. 공개 문서는 로그인 없이 계속 읽을 수 있습니다.
            </p>
            {devAuthConfigured() ? (
              <a
                className="acct-button"
                href={`/api/auth/dev?returnTo=${encodeURIComponent(returnTo)}`}
              >
                개발 계정으로 로그인
              </a>
            ) : googleConfigured() ? (
              <a
                className="acct-button"
                href={`/api/auth/google?returnTo=${encodeURIComponent(returnTo)}`}
              >
                Google로 로그인
              </a>
            ) : oauthConfigured() ? (
              <a
                className="acct-button"
                href={`/api/auth/github?returnTo=${encodeURIComponent(returnTo)}`}
              >
                GitHub로 로그인
              </a>
            ) : (
              <p className="acct-note">
                이 배포에는 계정 로그인이 설정되어 있지 않습니다. 운영 환경의
                OAuth 설정을 확인해 주세요.
              </p>
            )}
          </section>
        ) : (
          <>
            <section className="acct-card acct-profile">
              <div className="acct-avatar" aria-hidden="true">
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element -- small external avatar; next/image adds nothing here
                  <img src={user.avatar} alt="" referrerPolicy="no-referrer" />
                ) : (
                  <span>{initial(user.displayName)}</span>
                )}
              </div>
              <div className="acct-profile-text">
                <h2>
                  {profile?.nickname || user.displayName}
                  {profile && (
                    <ExpertiseBadges tier={profile.skill_tier} credentials={credentials} />
                  )}
                </h2>
                {user.email && <p className="acct-email">{user.email}</p>}
                <p className="acct-note">
                  {user.provider === "google"
                    ? "Google"
                    : user.provider === "github"
                      ? "GitHub"
                      : "ChatGPT"}{" "}
                  계정으로 로그인됨
                </p>
              </div>
              <a
                className="acct-button is-quiet"
                href={
                  user.provider === "chatgpt"
                    ? platformSignOutPath("/")
                    : "/api/auth/logout?returnTo=/"
                }
              >
                로그아웃
              </a>
            </section>

            {storeError && (
              <p className="acct-card acct-note" role="status">
                프로필 저장소에 연결하지 못했습니다. 신원 정보만 표시합니다. ({storeError})
              </p>
            )}
            {!storeReady && (
              <p className="acct-card acct-note" role="status">
                프로필 저장소가 읽기 전용 모드입니다. 닉네임·실력 측정·자격 인증은
                로컬에서 <code>npm run dev:full</code>로 시험할 수 있습니다.
              </p>
            )}

            {profile && (
              <>
                <section className="acct-card">
                  <div className="acct-card-head">
                    <h2>프로필</h2>
                    <span className="acct-note">닉네임만 공개됩니다</span>
                  </div>
                  <ProfileForm profile={profile} />
                </section>

                <section className="acct-card">
                  <div className="acct-card-head">
                    <h2>실력 측정</h2>
                    <span className="acct-note">퀴즈 기반 자기 진단</span>
                  </div>
                  <SkillAssessment
                    tier={profile.skill_tier}
                    attempts={profile.quiz_attempts}
                    bestPct={profile.quiz_best_pct}
                  />
                </section>

                <section className="acct-card">
                  <div className="acct-card-head">
                    <h2>전문성 인증</h2>
                    <span className="acct-note">관리자 심사 후 배지 부여</span>
                  </div>
                  <CredentialPanel initial={credentials} />
                </section>

                {admin && (
                  <section className="acct-card">
                    <div className="acct-card-head">
                      <h2>관리자</h2>
                      <span className="acct-badge is-push">ADMIN</span>
                    </div>
                    <p>제출된 자격 증빙을 심사할 수 있습니다.</p>
                    <Link className="acct-button" href="/admin/credentials">
                      자격 심사 큐 열기
                    </Link>
                  </section>
                )}
              </>
            )}

            <LearningDashboard showAccountAction={false} />

            <section className="acct-card">
              <div className="acct-card-head">
                <h2>편집 권한</h2>
                <span className={`acct-badge ${github ? (canPush ? "is-push" : "is-propose") : "is-none"}`}>
                  {github ? (canPush ? "직접 편집" : "PR 제안") : "읽기 전용"}
                </span>
              </div>

              {!github ? (
                <>
                  <p>
                    문서를 고치려면 GitHub 연동이 필요합니다. 모든 편집은 커밋으로
                    남고 연동한 GitHub 계정에 귀속됩니다.
                  </p>
                  {oauthConfigured() ? (
                    <a className="acct-button" href="/api/auth/github?returnTo=/account">
                      GitHub 연동하기
                    </a>
                  ) : (
                    <p className="acct-note">이 배포에는 GitHub 연동이 설정되어 있지 않습니다.</p>
                  )}
                </>
              ) : (
                <>
                  <dl className="acct-facts">
                    <div>
                      <dt>연동 계정</dt>
                      <dd>
                        <a href={`https://github.com/${github.login}`} target="_blank" rel="noreferrer">
                          @{github.login} ↗
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt>대상 저장소</dt>
                      <dd>
                        <a href={`https://github.com/${owner}/${repo}`} target="_blank" rel="noreferrer">
                          {owner}/{repo} ↗
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt>저장 방식</dt>
                      <dd>
                        {canPush
                          ? "게시하면 main에 바로 커밋되고 1~2분 뒤 반영됩니다."
                          : "push 권한이 없어 게시하면 PR로 제안되고, 관리자 병합 후 반영됩니다."}
                      </dd>
                    </div>
                  </dl>
                  {session?.user.provider !== "github" && (
                    <a className="acct-button is-quiet" href="/api/auth/github/unlink?returnTo=/account">
                      GitHub 연동 해제
                    </a>
                  )}
                </>
              )}
            </section>

            {github && (
              <section className="acct-card">
                <div className="acct-card-head">
                  <h2>기여 내역</h2>
                  <span className="acct-note">최근 {commits.length}건</span>
                </div>
                {commits.length === 0 ? (
                  <p className="acct-note">
                    아직 커밋한 편집이 없습니다. 문서에서 편집을 눌러 첫 기여를 남겨보세요.
                  </p>
                ) : (
                  <ul className="acct-list">
                    {commits.map((c) => (
                      <li key={c.sha}>
                        <a href={c.htmlUrl} target="_blank" rel="noreferrer">
                          {c.message}
                        </a>
                        <span>{formatDate(c.date)}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {proposals.length > 0 && (
                  <>
                    <h3 className="acct-subhead">제안한 PR</h3>
                    <ul className="acct-list">
                      {proposals.map((p) => (
                        <li key={p.number}>
                          <a href={p.htmlUrl} target="_blank" rel="noreferrer">
                            #{p.number} {p.title}
                          </a>
                          <span>{p.state === "open" ? "검토 중" : "종료"}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </section>
            )}

            <section className="acct-card">
              <h2>데이터와 개인정보</h2>
              <p>
                Google·GitHub 로그인 정보는 브라우저의 암호화된 세션 쿠키에
                담기고 7일 뒤 만료됩니다. 학습 경험치, 글 평가, 댓글, 게시글과
                제안은 계정 식별자와 함께 데이터베이스에 저장됩니다. 편집 기록은
                공개 저장소의 커밋으로 남습니다.
              </p>
              <p className="acct-links">
                <Link href="/privacy">개인정보 처리방침</Link> ·{" "}
                <Link href="/design/colors">색상 가이드</Link> ·{" "}
                <Link href="/contact">문의</Link>
              </p>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
