import type { UnsupportedSection } from "@/lib/contentful/types";

// Shown in development when a page references a content type that has no
// component in the registry yet. Hidden in production.
export function Unsupported({ contentType }: UnsupportedSection) {
  if (process.env.NODE_ENV === "production") return null;

  return (
    <section className="mx-auto my-8 max-w-5xl rounded-xl border-2 border-dashed border-amber-400 px-6 py-8 text-amber-700 dark:text-amber-400">
      No component registered for content type <code className="font-mono">{contentType}</code>.
      Add one in <code className="font-mono">components/sections/index.tsx</code>.
    </section>
  );
}
