type AutoplayToggleProps = {
  paused: boolean;
  onToggle: () => void;
  locale?: "ko" | "en";
  disabled?: boolean;
};

export function AutoplayToggle({
  paused,
  onToggle,
  locale = "ko",
  disabled = false,
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
      disabled={disabled}
      onClick={onToggle}
    >
      <svg aria-hidden="true" viewBox="0 0 20 20">
        {paused ? (
          <path d="m6.5 4.5 9 5.5-9 5.5v-11Z" />
        ) : (
          <path d="M5.5 4.5h3v11h-3v-11Zm6 0h3v11h-3v-11Z" />
        )}
      </svg>
    </button>
  );
}
