type AutoplayToggleProps = {
  paused: boolean;
  onToggle: () => void;
  locale?: "ko" | "en";
};

export function AutoplayToggle({
  paused,
  onToggle,
  locale = "ko",
}: AutoplayToggleProps) {
  const label =
    locale === "en"
      ? paused
        ? "Start autoplay"
        : "Pause autoplay"
      : paused
        ? "자동 재생 시작"
        : "자동 재생 일시정지";

  return (
    <button
      type="button"
      className={`autoplay-toggle ${paused ? "is-paused" : "is-playing"}`}
      aria-label={label}
      aria-pressed={paused}
      title={label}
      onClick={onToggle}
    >
      <svg aria-hidden="true" viewBox="0 0 20 20">
        {paused ? (
          <path d="m7 5 8 5-8 5V5Z" />
        ) : (
          <>
            <path d="M6.5 5.2v9.6" />
            <path d="M13.5 5.2v9.6" />
          </>
        )}
      </svg>
    </button>
  );
}
