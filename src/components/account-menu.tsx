"use client";

// Site-wide account menu (header). Google sign-in is the account layer;
// linking GitHub grants edit rights (commits / PR proposals). Renders nothing
// until /api/auth/me confirms at least one provider is configured, so an
// unconfigured deployment looks exactly as before.
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type Me = {
  providers: { google: boolean; github: boolean };
  user: { provider: "google" | "github"; name: string; email: string | null; avatar: string | null } | null;
  github: { login: string; avatar: string | null } | null;
};

const STRINGS = {
  ko: {
    account: "계정",
    signIn: "로그인",
    signInGoogle: "Google로 로그인",
    signInGithub: "GitHub로 로그인",
    signedInVia: (p: string) => `${p} 계정으로 로그인됨`,
    editRights: "편집 권한",
    linkGithub: "GitHub 연동하기",
    linkedAs: (login: string) => `@${login} 연동됨`,
    unlink: "연동 해제",
    editHint: "문서 편집(커밋·PR 제안)에는 GitHub 연동이 필요합니다.",
    signOut: "로그아웃",
  },
  en: {
    account: "Account",
    signIn: "Sign in",
    signInGoogle: "Sign in with Google",
    signInGithub: "Sign in with GitHub",
    signedInVia: (p: string) => `Signed in with ${p}`,
    editRights: "Edit access",
    linkGithub: "Link GitHub",
    linkedAs: (login: string) => `Linked as @${login}`,
    unlink: "Unlink",
    editHint: "Editing (commits & PR proposals) requires a linked GitHub account.",
    signOut: "Sign out",
  },
} as const;

function PersonIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="12" cy="8.2" r="3.6" />
      <path d="M5 20c.8-3.6 3.6-5.4 7-5.4s6.2 1.8 7 5.4" />
    </svg>
  );
}

export function AccountMenu({ locale = "ko" }: { locale?: "ko" | "en" }) {
  const t = STRINGS[locale];
  const pathname = usePathname() || "/";
  const returnTo = encodeURIComponent(pathname);
  const [me, setMe] = useState<Me | null>(null);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let live = true;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (live) setMe(d);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!me || (!me.providers.google && !me.providers.github)) return null;

  const providerLabel = me.user?.provider === "google" ? "Google" : "GitHub";

  return (
    <div className="account-menu" ref={rootRef}>
      <button
        type="button"
        className="account-trigger"
        aria-label={t.account}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {me.user?.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element -- tiny external avatar, next/image gains nothing
          <img src={me.user.avatar} alt="" referrerPolicy="no-referrer" />
        ) : (
          <PersonIcon />
        )}
      </button>

      {open && (
        <div className="account-pop" role="menu">
          {me.user ? (
            <>
              <div className="account-id">
                <strong>{me.user.name}</strong>
                {me.user.email && <span>{me.user.email}</span>}
                <span className="account-provider">{t.signedInVia(providerLabel)}</span>
              </div>
              <div className="account-section">
                <span className="account-label">{t.editRights}</span>
                {me.github ? (
                  <span className="account-linked">
                    {t.linkedAs(me.github.login)}
                    {me.user.provider !== "github" && (
                      <a href={`/api/auth/github/unlink?returnTo=${returnTo}`}>{t.unlink}</a>
                    )}
                  </span>
                ) : me.providers.github ? (
                  <>
                    <a className="account-action" href={`/api/auth/github?returnTo=${returnTo}`}>
                      {t.linkGithub}
                    </a>
                    <span className="account-hint">{t.editHint}</span>
                  </>
                ) : (
                  <span className="account-hint">{t.editHint}</span>
                )}
              </div>
              <a className="account-action is-quiet" href={`/api/auth/logout?returnTo=${returnTo}`}>
                {t.signOut}
              </a>
            </>
          ) : (
            <>
              {me.providers.google && (
                <a className="account-action" href={`/api/auth/google?returnTo=${returnTo}`}>
                  {t.signInGoogle}
                </a>
              )}
              {me.providers.github && (
                <a className="account-action" href={`/api/auth/github?returnTo=${returnTo}`}>
                  {t.signInGithub}
                </a>
              )}
              <span className="account-hint">{t.editHint}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
