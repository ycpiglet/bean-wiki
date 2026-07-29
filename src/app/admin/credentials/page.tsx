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
            <h2>저장소가 설정되지 않았습니다</h2>
            <p className="acct-note">SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 설정해주세요.</p>
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
        ) : (
          <section className="acct-card">
            <div className="acct-card-head">
              <h2>심사 대기</h2>
            </div>
            <CredentialReview initial={await listPendingCredentials()} />
          </section>
        )}
      </div>
    </main>
  );
}
