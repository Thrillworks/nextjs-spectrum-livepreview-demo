import { cacheLife, cacheTag } from "next/cache";
import { draftMode } from "next/headers";
import { contentfulGraphQL, isContentfulConfigured } from "./client";
import { toArticle, toPage } from "./mappers";
import type { Article, ArticleResult, Page, PageResult } from "./types";

// Every Contentful read is tagged so the /api/revalidate webhook can refresh
// them all at once when content is published.
export const CONTENTFUL_TAG = "contentful";

const ASSET_FIELDS = /* GraphQL */ `
  fragment AssetFields on Asset {
    url
    title
    description
    width
    height
  }
`;

// One fragment per section type. Add a fragment here when you add a component.
// Collection limits keep the query under Contentful's complexity limit.
const PAGE_QUERY = /* GraphQL */ `
  ${ASSET_FIELDS}

  query Page($slug: String!, $preview: Boolean!) {
    pageCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
      items {
        sys { id }
        title
        slug
        hero(preview: $preview) {
          sys { id }
          heading
          text
          image(preview: $preview) { ...AssetFields }
        }
        sectionsCollection(limit: 20, preview: $preview) {
          items {
            __typename
            ... on Entry {
              sys { id }
            }
            ... on MediaCopy {
              heading
              body { json }
              image(preview: $preview) { ...AssetFields }
              imagePosition
              linkLabel
              linkUrl
            }
            ... on ContactForm {
              heading
              description
              formType
              submitLabel
            }
          }
        }
      }
    }
  }
`;

const ARTICLE_QUERY = /* GraphQL */ `
  ${ASSET_FIELDS}

  query Article($slug: String!, $preview: Boolean!) {
    articleCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
      items {
        sys { id }
        title
        slug
        date
        heroImage(preview: $preview) { ...AssetFields }
        categoryTagsCollection(limit: 10, preview: $preview) {
          items {
            sys { id }
            name
            slug
          }
        }
        body { json }
      }
    }
  }
`;

const ARTICLE_SLUGS_QUERY = /* GraphQL */ `
  query ArticleSlugs($preview: Boolean!) {
    articleCollection(limit: 1000, preview: $preview) {
      items { slug }
    }
  }
`;

const PAGE_SLUGS_QUERY = /* GraphQL */ `
  query PageSlugs($preview: Boolean!) {
    pageCollection(limit: 1000, preview: $preview) {
      items { slug }
    }
  }
`;

export async function getPage(slug: string): Promise<Page | null> {
  "use cache";
  cacheTag(CONTENTFUL_TAG, `page:${slug}`);
  cacheLife("hours");

  if (!isContentfulConfigured) return null;

  // Draft mode skips the cache entirely, so preview always shows fresh drafts.
  const { isEnabled: preview } = await draftMode();

  const data = await contentfulGraphQL<{ pageCollection: { items: PageResult[] } }>(
    PAGE_QUERY,
    { slug },
    preview,
  );

  const page = data.pageCollection.items[0];
  return page ? toPage(page) : null;
}

export async function getPageSlugs(): Promise<string[]> {
  "use cache";
  cacheTag(CONTENTFUL_TAG);
  cacheLife("hours");

  if (!isContentfulConfigured) return [];

  const data = await contentfulGraphQL<{ pageCollection: { items: { slug: string }[] } }>(
    PAGE_SLUGS_QUERY,
    {},
    false,
  );

  return data.pageCollection.items.map((item) => item.slug);
}

export async function getArticle(slug: string): Promise<Article | null> {
  "use cache";
  cacheTag(CONTENTFUL_TAG, `article:${slug}`);
  cacheLife("hours");

  if (!isContentfulConfigured) return null;

  const { isEnabled: preview } = await draftMode();

  const data = await contentfulGraphQL<{ articleCollection: { items: ArticleResult[] } }>(
    ARTICLE_QUERY,
    { slug },
    preview,
  );

  const article = data.articleCollection.items[0];
  return article ? toArticle(article) : null;
}

export async function getArticleSlugs(): Promise<string[]> {
  "use cache";
  cacheTag(CONTENTFUL_TAG);
  cacheLife("hours");

  if (!isContentfulConfigured) return [];

  const data = await contentfulGraphQL<{ articleCollection: { items: { slug: string }[] } }>(
    ARTICLE_SLUGS_QUERY,
    {},
    false,
  );

  return data.articleCollection.items.map((item) => item.slug);
}
