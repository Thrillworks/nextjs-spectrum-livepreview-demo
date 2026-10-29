// Creates the demo content model (page, hero, textBlock, cardGrid, card) and
// sample "home" and "about" pages in your Contentful space.
//
//   npm run contentful:seed
//
// Needs CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN in .env.local.
// Safe to re-run: anything that already exists is left untouched.

import { createClient } from "contentful-management";

const { CONTENTFUL_SPACE_ID, CONTENTFUL_MANAGEMENT_TOKEN, CONTENTFUL_ENVIRONMENT = "master" } =
  process.env;

if (!CONTENTFUL_SPACE_ID || !CONTENTFUL_MANAGEMENT_TOKEN) {
  console.error("Set CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN in .env.local first.");
  process.exit(1);
}

const client = createClient(
  { accessToken: CONTENTFUL_MANAGEMENT_TOKEN },
  { type: "plain", defaults: { spaceId: CONTENTFUL_SPACE_ID, environmentId: CONTENTFUL_ENVIRONMENT } },
);

const contentTypes = [
  {
    id: "card",
    name: "Card",
    displayField: "title",
    fields: [
      { id: "title", name: "Title", type: "Symbol", required: true },
      { id: "description", name: "Description", type: "Text" },
      { id: "image", name: "Image", type: "Link", linkType: "Asset" },
      { id: "linkUrl", name: "Link URL", type: "Symbol" },
    ],
  },
  {
    id: "hero",
    name: "Hero",
    displayField: "headline",
    fields: [
      { id: "headline", name: "Headline", type: "Symbol", required: true },
      { id: "subheadline", name: "Subheadline", type: "Text" },
      { id: "image", name: "Background image", type: "Link", linkType: "Asset" },
      { id: "ctaLabel", name: "CTA label", type: "Symbol" },
      { id: "ctaUrl", name: "CTA URL", type: "Symbol" },
    ],
  },
  {
    id: "textBlock",
    name: "Text Block",
    displayField: "heading",
    fields: [
      { id: "heading", name: "Heading", type: "Symbol" },
      { id: "body", name: "Body", type: "RichText" },
    ],
  },
  {
    id: "cardGrid",
    name: "Card Grid",
    displayField: "heading",
    fields: [
      { id: "heading", name: "Heading", type: "Symbol" },
      {
        id: "cards",
        name: "Cards",
        type: "Array",
        items: { type: "Link", linkType: "Entry", validations: [{ linkContentType: ["card"] }] },
      },
    ],
  },
  {
    id: "page",
    name: "Page",
    displayField: "title",
    fields: [
      { id: "title", name: "Title", type: "Symbol", required: true },
      {
        id: "slug",
        name: "Slug",
        type: "Symbol",
        required: true,
        validations: [{ unique: true }],
      },
      {
        id: "sections",
        name: "Sections",
        type: "Array",
        items: {
          type: "Link",
          linkType: "Entry",
          validations: [{ linkContentType: ["hero", "textBlock", "cardGrid"] }],
        },
      },
    ],
  },
];

const link = (id) => ({ sys: { type: "Link", linkType: "Entry", id } });

const richText = (...paragraphs) => ({
  nodeType: "document",
  data: {},
  content: paragraphs.map((value) => ({
    nodeType: "paragraph",
    data: {},
    content: [{ nodeType: "text", value, marks: [], data: {} }],
  })),
});

// Ordered so linked entries are published before the entries that link to them.
const entries = [
  { id: "card-fast", type: "card", fields: { title: "Fast", description: "Pages are prerendered and cached at the edge, then refreshed when content is published.", linkUrl: "/about" } },
  { id: "card-flexible", type: "card", fields: { title: "Flexible", description: "Editors compose pages from sections without waiting on a deploy." } },
  { id: "card-typed", type: "card", fields: { title: "Typed", description: "Every content type maps to a typed React component." } },
  { id: "home-hero", type: "hero", fields: { headline: "Built with Contentful + Next.js", subheadline: "Every section on this page is a Contentful entry rendered by a React component.", ctaLabel: "Learn more", ctaUrl: "/about" } },
  { id: "home-intro", type: "textBlock", fields: { heading: "How it works", body: richText("A Page entry holds an ordered list of section entries. The app looks up each section's content type and renders the matching component.", "Reorder, add, or remove sections in Contentful and the page follows.") } },
  { id: "home-features", type: "cardGrid", fields: { heading: "Why this setup", cards: [link("card-fast"), link("card-flexible"), link("card-typed")] } },
  { id: "about-hero", type: "hero", fields: { headline: "About this demo", subheadline: "A second page, served from the same [slug] route." } },
  { id: "about-body", type: "textBlock", fields: { heading: "Add your own", body: richText("Create a new Page entry with any slug and it is available at /<slug> as soon as it is published.") } },
  { id: "page-home", type: "page", fields: { title: "Home", slug: "home", sections: [link("home-hero"), link("home-intro"), link("home-features")] } },
  { id: "page-about", type: "page", fields: { title: "About", slug: "about", sections: [link("about-hero"), link("about-body")] } },
];

async function exists(get) {
  try {
    await get();
    return true;
  } catch (error) {
    if (error.name === "NotFound" || error.status === 404) return false;
    throw error;
  }
}

const locales = await client.locale.getMany({ query: {} });
const locale = locales.items.find((l) => l.default)?.code ?? "en-US";

for (const { id, ...data } of contentTypes) {
  if (await exists(() => client.contentType.get({ contentTypeId: id }))) {
    console.log(`content type ${id}: exists, skipping`);
    continue;
  }
  const created = await client.contentType.createWithId({ contentTypeId: id }, data);
  await client.contentType.publish({ contentTypeId: id }, created);
  console.log(`content type ${id}: created`);
}

for (const { id, type, fields } of entries) {
  if (await exists(() => client.entry.get({ entryId: id }))) {
    console.log(`entry ${id}: exists, skipping`);
    continue;
  }
  const localized = Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, { [locale]: value }]),
  );
  const created = await client.entry.createWithId(
    { contentTypeId: type, entryId: id },
    { fields: localized },
  );
  await client.entry.publish({ entryId: id }, created);
  console.log(`entry ${id}: created`);
}

console.log("\nDone. Start the app with `npm run dev`.");
