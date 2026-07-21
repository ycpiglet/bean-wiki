// Shared bean glyph. Previously duplicated as BeanMark/BeanLogo in 6 files.
export function BeanMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={compact ? "bean-mark bean-mark-small" : "bean-mark"}>
      <svg aria-hidden="true" viewBox="0 0 48 48">
        <path d="M34.7 7.7C27.6 3.6 17 7.4 11.2 16.3 5.4 25.2 6.8 36 14 40.5c7.2 4.5 17.7.9 23.6-8 5.8-8.9 4.3-20.5-2.9-24.8Z" />
        <path d="M34.5 8.4c-2.3 7.9-8.7 9.2-13 14.6-4.1 5.2-4.9 10.3-4.2 16.2" />
      </svg>
    </span>
  );
}
