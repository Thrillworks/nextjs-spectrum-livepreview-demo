# demo-cms-spectrum

Next.js demo that builds pages from Contentful entries, fetched with Contentful's GraphQL Content API. A `page` entry holds an ordered list of section entries, and each section's content type is rendered by a matching React component.

## Setup

1. Copy `.env.example` to `.env.local` and fill in your space ID, Delivery and Preview API tokens (Contentful → Settings → API keys).

The .env file should have the following keys for local development

```
# Contentful → Settings → API keys
CONTENTFUL_SPACE_ID=
CONTENTFUL_ENVIRONMENT=master
CONTENTFUL_DELIVERY_TOKEN=
CONTENTFUL_PREVIEW_TOKEN=
```

1. To create the content model and sample pages, add a CMA token (Contentful → Settings → CMA tokens) and run:

```bash
 npm run contentful:seed
```

This creates the `page`, `hero`, `textBlock`, `cardGrid` and `card` content types plus `home` and `about` pages. It skips anything that already exists. 2. `npm run dev` and open [http://localhost:3000](http://localhost:3000).

## How it fits together

| Path                        | Role                                                           |
| --------------------------- | -------------------------------------------------------------- |
| `lib/contentful/client.ts`  | Sends GraphQL requests (delivery or preview)                   |
| `lib/contentful/types.ts`   | GraphQL response types and the plain props components receive  |
| `lib/contentful/mappers.ts` | Turns query results into those props                           |
| `lib/contentful/queries.ts` | GraphQL queries and cached fetches (`getPage`, `getPageSlugs`) |
| `components/sections/`      | One component per section type, registered in `index.tsx`      |
| `app/page.tsx`              | Renders the page with slug `home`                              |
| `app/[slug]/page.tsx`       | Renders every other page                                       |

### Adding a component

1. Create the content type in Contentful and allow it in the `page.sections` field validation.
2. Add a `... on <TypeName>` fragment to `PAGE_QUERY` in `lib/contentful/queries.ts`. GraphQL type names are the content type ID in PascalCase (`textBlock` → `TextBlock`), and reference lists are queried as `<field>Collection { items }`.
3. Add its result type and props type to `lib/contentful/types.ts` (and to the `SectionResult` and `Section` unions).
4. Map it in `toSection` in `lib/contentful/mappers.ts`, keyed on `__typename`.
5. Build the component in `components/sections/` and register it in `components/sections/index.tsx`.

Until steps 2–5 are done, the page shows a dashed placeholder for that section in development.

## Preview and publishing

- **Preview:** set the Contentful preview URL to `http://localhost:3000/api/draft?secret=<CONTENTFUL_PREVIEW_SECRET>&slug={entry.fields.slug}`. Draft mode reads from the Preview API and bypasses the cache. `/api/disable-draft` turns it off.
- **Publishing:** content is cached for up to an hour. To refresh on publish, add a Contentful webhook that POSTs to `/api/revalidate` with an `x-revalidate-secret` header set to `CONTENTFUL_REVALIDATE_SECRET`.
