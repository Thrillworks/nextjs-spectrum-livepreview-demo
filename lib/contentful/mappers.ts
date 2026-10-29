import type {
  Article,
  ArticleResult,
  AssetResult,
  ContactFormVariant,
  HeroResult,
  HeroSection,
  ImageData,
  OtherSectionResult,
  Page,
  PageResult,
  Section,
  SectionResult,
} from "./types";

function toImage(asset: AssetResult | null): ImageData | undefined {
  if (!asset?.url) return undefined;

  return {
    url: asset.url,
    alt: asset.description || asset.title || "",
    width: asset.width ?? 1600,
    height: asset.height ?? 900,
  };
}

function toHero(hero: HeroResult): HeroSection {
  return {
    type: "hero",
    id: hero.sys.id,
    heading: hero.heading,
    text: hero.text ?? undefined,
    image: toImage(hero.image),
  };
}

// Contentful stores formType as a display label ("Contact Us"). Unknown
// values fall back to the contact form.
const FORM_VARIANTS: Record<string, ContactFormVariant> = {
  "contact us": "contactUs",
  subscribe: "subscribe",
};

function toFormVariant(formType: string | null): ContactFormVariant {
  return FORM_VARIANTS[formType?.trim().toLowerCase() ?? ""] ?? "contactUs";
}

function toSection(result: SectionResult | OtherSectionResult): Section {
  const section = result as SectionResult;
  const id = section.sys.id;

  switch (section.__typename) {
    case "MediaCopy":
      return {
        type: "mediaCopy",
        id,
        heading: section.heading ?? undefined,
        body: section.body?.json,
        image: toImage(section.image),
        imagePosition: section.imagePosition === "right" ? "right" : "left",
        link:
          section.linkLabel && section.linkUrl
            ? { label: section.linkLabel, url: section.linkUrl }
            : undefined,
      };
    case "ContactForm":
      return {
        type: "contactForm",
        id,
        heading: section.heading ?? undefined,
        description: section.description ?? undefined,
        variant: toFormVariant(section.formType),
        submitLabel: section.submitLabel || "Submit",
      };
    default:
      // Content types allowed in page.sections but without a query fragment yet.
      return { type: "unsupported", id, contentType: result.__typename };
  }
}

export function toArticle(article: ArticleResult): Article {
  return {
    id: article.sys.id,
    title: article.title,
    slug: article.slug,
    date: article.date ?? undefined,
    heroImage: toImage(article.heroImage),
    tags: (article.categoryTagsCollection?.items ?? [])
      .filter((tag) => tag !== null)
      .map((tag) => ({ id: tag.sys.id, name: tag.name, slug: tag.slug })),
    body: article.body?.json,
  };
}

// The page's hero is a separate single-reference field, rendered ahead of
// the sections list.
export function toPage(page: PageResult): Page {
  const sections = (page.sectionsCollection?.items ?? [])
    .filter((section) => section !== null)
    .map(toSection);

  return {
    id: page.sys.id,
    title: page.title,
    slug: page.slug,
    sections: page.hero ? [toHero(page.hero), ...sections] : sections,
  };
}
