import type { Document } from "@contentful/rich-text-types";

// Shapes returned by the GraphQL queries in queries.ts. Contentful names
// GraphQL types after content type IDs in PascalCase (mediaCopy → MediaCopy)
// and exposes reference lists as <field>Collection { items }.

type Sys = { sys: { id: string } };

export type AssetResult = {
  url: string;
  title: string | null;
  description: string | null;
  width: number | null;
  height: number | null;
};

export type HeroResult = Sys & {
  heading: string;
  text: string | null;
  image: AssetResult | null;
};

export type MediaCopyResult = Sys & {
  __typename: "MediaCopy";
  heading: string | null;
  body: { json: Document } | null;
  image: AssetResult | null;
  imagePosition: string | null;
  linkLabel: string | null;
  linkUrl: string | null;
};

export type ContactFormResult = Sys & {
  __typename: "ContactForm";
  heading: string | null;
  description: string | null;
  formType: string | null;
  submitLabel: string | null;
};

// Any section type the query has no fragment for yet.
export type OtherSectionResult = Sys & { __typename: string };

export type SectionResult = MediaCopyResult | ContactFormResult;

export type ArticleResult = Sys & {
  title: string;
  slug: string;
  date: string | null;
  heroImage: AssetResult | null;
  categoryTagsCollection: { items: ({ sys: { id: string }; name: string; slug: string } | null)[] } | null;
  body: { json: Document } | null;
};

export type PageResult = Sys & {
  title: string;
  slug: string;
  hero: HeroResult | null;
  sectionsCollection: { items: (SectionResult | OtherSectionResult | null)[] } | null;
};

// Plain props handed to components. Query results are mapped into these so
// that components don't depend on the GraphQL response shape.

export type ImageData = {
  url: string;
  alt: string;
  width: number;
  height: number;
};

export type HeroSection = {
  type: "hero";
  id: string;
  heading: string;
  text?: string;
  image?: ImageData;
};

export type MediaCopySection = {
  type: "mediaCopy";
  id: string;
  heading?: string;
  body?: Document;
  image?: ImageData;
  imagePosition: "left" | "right";
  link?: { label: string; url: string };
};

// Field sets the ContactForm component can render, keyed from formType.
export type ContactFormVariant = "contactUs" | "subscribe";

export type ContactFormSection = {
  type: "contactForm";
  id: string;
  heading?: string;
  description?: string;
  variant: ContactFormVariant;
  submitLabel: string;
};

// A section whose content type has no component yet.
export type UnsupportedSection = {
  type: "unsupported";
  id: string;
  contentType: string;
};

export type Section =
  | HeroSection
  | MediaCopySection
  | ContactFormSection
  | UnsupportedSection;

export type Article = {
  id: string;
  title: string;
  slug: string;
  // ISO date (YYYY-MM-DD)
  date?: string;
  heroImage?: ImageData;
  tags: { id: string; name: string; slug: string }[];
  body?: Document;
};

export type Page = {
  id: string;
  title: string;
  slug: string;
  sections: Section[];
};
