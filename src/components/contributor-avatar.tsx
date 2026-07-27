import type { ContributorProfile } from "@/content/contributors";

export function ContributorAvatar({
  contributor,
  size = "medium",
}: {
  contributor: ContributorProfile;
  size?: "medium" | "large";
}) {
  return (
    <span
      className={`contributor-avatar accent-${contributor.accent} is-${size}`}
      aria-hidden="true"
    >
      {contributor.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element -- OAuth avatar URLs are external and provider-specific
        <img
          src={contributor.avatar}
          alt=""
          referrerPolicy="no-referrer"
        />
      ) : (
        <>
          <svg viewBox="0 0 52 52">
            <path d="M31.5 7.8c8.9 4.2 12.6 15 8.4 24.3-4.3 9.3-14.9 13.3-23.8 9.1C7.2 37 3.4 26.2 7.7 17 12 7.7 22.6 3.6 31.5 7.8Z" />
            <path d="M31.9 9.6c.7 8.6-4.8 10.3-8.8 15.1-3.1 3.7-3.5 8.5-1.4 13.8" />
          </svg>
          <b>{contributor.monogram}</b>
        </>
      )}
    </span>
  );
}

