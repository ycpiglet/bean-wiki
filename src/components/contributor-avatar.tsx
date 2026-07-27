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
      <b>{contributor.monogram.slice(0, 2).toUpperCase()}</b>
    </span>
  );
}
