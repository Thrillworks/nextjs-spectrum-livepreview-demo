import {
  documentToReactComponents,
  type Options,
} from "@contentful/rich-text-react-renderer";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import Image from "next/image";
import Link from "next/link";
import type { MediaCopySection } from "@/lib/contentful/types";
import { nunitoSans } from "@/lib/fonts";

const richTextOptions: Options = {
  renderNode: {
    [BLOCKS.HEADING_2]: (_, children) => (
      <h2 className="mt-10 text-2xl font-bold tracking-tight">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (_, children) => (
      <h3 className="mt-8 text-xl font-bold">{children}</h3>
    ),
    [BLOCKS.PARAGRAPH]: (_, children) => (
      <p className="mt-4 text-lg leading-6">{children}</p>
    ),
    [BLOCKS.UL_LIST]: (_, children) => (
      <ul className="mt-6 list-disc space-y-4 pl-[18px] [&_p]:mt-0 [&_p]:text-[15px] [&_p]:leading-5">
        {children}
      </ul>
    ),
    [BLOCKS.OL_LIST]: (_, children) => (
      <ol className="mt-6 list-decimal space-y-4 pl-[18px] [&_p]:mt-0 [&_p]:text-[15px] [&_p]:leading-5">
        {children}
      </ol>
    ),
    [BLOCKS.QUOTE]: (_, children) => (
      <blockquote className="mt-6 border-l-4 border-zinc-300 pl-4 italic text-zinc-600">
        {children}
      </blockquote>
    ),
    [INLINES.HYPERLINK]: (node, children) => (
      <a
        href={node.data.uri}
        className="font-semibold text-[#00589b] underline underline-offset-4"
      >
        {children}
      </a>
    ),
  },
};

function Chevron() {
  return (
    <svg
      viewBox="0 0 8 12"
      className="h-3 w-2 stroke-current"
      fill="none"
      aria-hidden
    >
      <path d="M1.5 1.5L6 6l-4.5 4.5" strokeWidth="2" />
    </svg>
  );
}

export function MediaCopy({
  heading,
  body,
  image,
  imagePosition,
  link,
}: MediaCopySection) {
  const title = heading && (
    <span className="inline-flex items-center gap-3">
      {heading}
      {link && <Chevron />}
    </span>
  );

  return (
    <section
      className={`${nunitoSans.className} grid bg-white md:min-h-[655px] md:grid-cols-[46.5%_1fr] py-10`}
    >
      <div
        className={`relative h-72 bg-zinc-100 sm:h-96 md:h-auto ${imagePosition === "right" ? "md:order-last" : ""}`}
      >
        {image && (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="(min-width: 768px) 47vw, 100vw"
            className="object-cover"
          />
        )}
      </div>
      <div className="max-w-[540px] px-6 py-10 text-[#333] md:px-16 md:py-16">
        {heading && (
          <h2 className="text-[22px] font-bold text-[#00589b]">
            {link ? <Link href={link.url}>{title}</Link> : title}
          </h2>
        )}
        <div
          className="mt-4 mb-8 w-16 border-b-[3px] border-dotted border-[#00589b]"
          aria-hidden
        />
        {body && documentToReactComponents(body, richTextOptions)}
      </div>
    </section>
  );
}
