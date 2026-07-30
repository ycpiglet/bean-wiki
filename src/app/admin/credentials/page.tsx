// Admin-only credential review queue. Not linked from public navigation; the
// account page surfaces it for admins only.
import type { Metadata } from "next";
import Link from "next/link";
import { BeanMark } from "@/components/bean-logo";
import { CredentialReview } from "@/components/credential-review";
import { ThemeToggle } from "@/components/theme-toggle";
import { adminConfigured, isAdminUser } from "@/lib/admin";
import { getPlatformUser } from "@/lib/platform-auth";
import { findProfile, listPendingCredentials, profileStoreConfigured } from "@/lib/profile-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "자격 심사",
  robots: { index: false, follow: false },
};

export default async function AdminCredentialsPage() {
  const user = await getPlatformUser();
  const storeReady = profileStoreConfigured();
  const profile = user && storeReady ? await findProfile(user.accountKey).catch(() => null) : null;
  const admin = isAdminUser(user, profile);
  const pending =
    storeReady && user && admin
      ? await listPendingCredentials().catch(() => null)
      : [];

  return (
    <main className="article-page">
      <header className="article-header shell">
        <Link href="/" className="brand" aria-label="Bean Wiki 홈">
          <BeanMark compact />
          <span>BEAN</span>
          <em>WIKI</em>
        </Link>
        <div className="header-tools">
          <Link href="/account" className="back-link">← 계정</Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="shell acct">
        <header className="acct-head">
          <span className="eyebrow">ADMIN</span>
          <h1>자격 심사</h1>
          <p>
            제출된 자격 증빙을 확인하고 승인하면 신청자 프로필에 인증 배지가 붙습니다.
            반려하면 사유가 신청자에게 표시됩니다.
          </p>
        </header>

        {!storeReady ? (
          <section className="acct-card acct-empty">
            <h2>자격 심사가 일시 중지되었습니다</h2>
            <p className="acct-note">
              공개 위키는 정상적으로 이용할 수 있습니다. 로컬 개발에서는
              <code> npm run dev:full</code>로 심사 기능을 시험할 수 있습니다.
            </p>
          </section>
        ) : !user ? (
          <section className="acct-card acct-empty">
            <h2>로그인이 필요합니다</h2>
            <a className="acct-button" href="/api/auth/google?returnTo=/admin/credentials">
              Google로 로그인
            </a>
          </section>
        ) : !admin ? (
          <section className="acct-card acct-empty">
            <h2>권한이 없습니다</h2>
            <p className="acct-note">
              {adminConfigured()
                ? "이 계정은 관리자가 아닙니다."
                : "관리자가 지정되지 않았습니다. ADMIN_EMAILS 환경변수를 설정해주세요."}
            </p>
          </section>
        ) : pending === null ? (
          <section className="acct-card acct-empty">
            <h2>저장소에 연결하지 못했습니다</h2>
            <p className="acct-note">잠시 후 다시 시도해주세요.</p>
          </section>
        ) : (
          <section className="acct-card">
            <div className="acct-card-head">
              <h2>심사 대기</h2>
            </div>
            <CredentialReview initial={pending} />
          </section>
        )}
      </div>
    </main>
  );
}
