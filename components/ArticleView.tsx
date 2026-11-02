import { useContentfulInspectorMode } from "@contentful/live-preview/react";
import {
  documentToReactComponents,
  type Options,
} from "@contentful/rich-text-react-renderer";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import Image from "next/image";
import type { Article } from "@/lib/contentful/types";
import { nunitoSans } from "@/lib/fonts";

const richTextOptions: Options = {
  renderNode: {
    [BLOCKS.HEADING_2]: (_, children) => (
      <h2 className="mt-10 text-xl font-bold leading-7 text-[#1b2a4a]">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (_, children) => (
      <h3 className="mt-8 text-lg font-bold text-[#1b2a4a]">{children}</h3>
    ),
    [BLOCKS.PARAGRAPH]: (_, children) => (
      <p className="mt-4 text-[15px] leading-6">{children}</p>
    ),
    [BLOCKS.UL_LIST]: (_, children) => (
      <ul className="mt-4 list-[square] space-y-3 pl-5 marker:text-[#1b2a4a] [&_p]:mt-0">
        {children}
      </ul>
    ),
    [BLOCKS.OL_LIST]: (_, children) => (
      <ol className="mt-4 list-decimal space-y-3 pl-5 [&_p]:mt-0">{children}</ol>
    ),
    [BLOCKS.QUOTE]: (_, children) => (
      <blockquote className="mt-6 border-l-4 border-[#00589b] pl-4 italic">{children}</blockquote>
    ),
    // Hyperlinks aren't supported: render the link text as plain text. The
    // renderer would otherwise emit a default <a> for these nodes.
    [INLINES.HYPERLINK]: (_, children) => <>{children}</>,
    [INLINES.ENTRY_HYPERLINK]: (_, children) => <>{children}</>,
    [INLINES.ASSET_HYPERLINK]: (_, children) => <>{children}</>,
  },
};

// "2025-01-04" -> "January 4th, 2025". Parsed by hand so the date never
// shifts a day across time zones.
function formatDate(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return iso;

  const monthName = new Date(Date.UTC(year, month - 1, day)).toLocaleString("en-CA", {
    month: "long",
    timeZone: "UTC",
  });
  const suffix =
    day % 100 >= 11 && day % 100 <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[day % 10] ?? "th";

  return `${monthName} ${day}${suffix}, ${year}`;
}

export function ArticleView({ id, title, date, heroImage, tags, body }: Article) {
  const inspectorProps = useContentfulInspectorMode({ entryId: id });

  return (
    <main className={`${nunitoSans.className} flex-1 bg-white text-[#333]`}>
      <article className="mx-auto max-w-3xl px-6 pb-20 pt-10">
        {tags.length > 0 && (
          <ul
            className="flex flex-wrap gap-2"
            {...inspectorProps({ fieldId: "categoryTags" })}
          >
            {tags.map((tag) => (
              <li
                key={tag.id}
                className="bg-[#00589b] px-3 py-1 text-xs font-semibold text-white"
              >
                {tag.name}
              </li>
            ))}
          </ul>
        )}

        <h1
          className="mt-6 text-[32px] font-normal leading-[1.2] text-[#1b3a6b]"
          {...inspectorProps({ fieldId: "title" })}
        >
          {title}
        </h1>

        {date && (
          <p className="mt-4 text-xs text-[#555]" {...inspectorProps({ fieldId: "date" })}>
            {formatDate(date)}
          </p>
        )}

        {heroImage && (
          <Image
            src={heroImage.url}
            alt={heroImage.alt}
            width={heroImage.width}
            height={heroImage.height}
            priority
            sizes="(min-width: 768px) 768px, 100vw"
            className="mt-6 aspect-[16/9] w-full object-cover"
            {...inspectorProps({ fieldId: "heroImage" })}
          />
        )}

        <div className="mt-10" {...inspectorProps({ fieldId: "body" })}>
          {body && documentToReactComponents(body, richTextOptions)}
        </div>
      </article>
    </main>
  );
}
