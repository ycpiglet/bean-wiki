// Renders a JSON-LD structured-data block. Safe to place anywhere in the
// document body — crawlers read it regardless of position.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Content is our own static data, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
