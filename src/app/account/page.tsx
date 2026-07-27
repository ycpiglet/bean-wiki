// Account management for the Vercel deployment: Google account profile, the
// GitHub edit-rights link, and the contribution record that link produced.
// Everything here reads the encrypted session cookie (src/lib/session.ts) —
// there is no user database; GitHub is the system of record for edits.
import type { Metadata } from "next";
import Link from "next/link";
import { BeanMark } from "@/components/bean-logo";
import { AccountMenu } from "@/components/account-menu";
import { HeaderSearchButton } from "@/components/header-search-button";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { getRepoConfig, ghCanPush, ghCommitsByAuthor, ghProposalsFor } from "@/lib/github";
import { googleConfigured, oauthConfigured } from "@/lib/oauth";
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

export default async function AccountPage() {
  const session = await readSession();
  const { owner, repo } = getRepoConfig();

  const github = session?.github ?? null;
  const canPush = github ? await ghCanPush(github.token) : false;
  const [commits, proposals] = github
    ? await Promise.all([
        ghCommitsByAuthor(github.login, github.token),
        ghProposalsFor(github.login, github.token),
      ])
    : [[], []];

  return (
    <main className="article-page">
      <header className="article-header shell">
        <Link href="/" className="brand" aria-label="Bean Wiki 홈">
          <BeanMark compact />
          <span>BEAN</span>
          <em>WIKI</em>
        </Link>
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

        {!session ? (
          <section className="acct-card acct-empty">
            <h2>로그인이 필요합니다</h2>
            <p>
              Google 계정으로 로그인하면 프로필과 편집 권한 상태를 이곳에서
              관리할 수 있습니다.
            </p>
            {googleConfigured() ? (
              <a className="acct-button" href="/api/auth/google?returnTo=/account">
                Google로 로그인
              </a>
            ) : oauthConfigured() ? (
              <a className="acct-button" href="/api/auth/github?returnTo=/account">
                GitHub로 로그인
              </a>
            ) : (
              <p className="acct-note">이 배포에는 로그인이 설정되어 있지 않습니다.</p>
            )}
          </section>
        ) : (
          <>
            <section className="acct-card acct-profile">
              <div className="acct-avatar" aria-hidden="true">
                {session.user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element -- small external avatar; next/image adds nothing here
                  <img src={session.user.avatar} alt="" referrerPolicy="no-referrer" />
                ) : (
                  <span>{initial(session.user.name)}</span>
                )}
              </div>
              <div className="acct-profile-text">
                <h2>{session.user.name}</h2>
                {session.user.email && <p className="acct-email">{session.user.email}</p>}
                <p className="acct-note">
                  {session.user.provider === "google" ? "Google" : "GitHub"} 계정으로 로그인됨
                </p>
              </div>
              <a className="acct-button is-quiet" href="/api/auth/logout?returnTo=/">
                로그아웃
              </a>
            </section>

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
                  {session.user.provider !== "github" && (
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
                Bean Wiki는 별도의 회원 데이터베이스를 두지 않습니다. 로그인 정보는
                브라우저의 암호화된 세션 쿠키에만 담기고 7일 뒤 만료됩니다.
                로그아웃하면 즉시 삭제되며, 편집 기록은 공개 저장소의 커밋으로
                남습니다.
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
