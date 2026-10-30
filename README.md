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

## Deployment

Every push to `main` deploys to <https://spectrum-livepreview.thrillworks.site> through `.github/workflows/deploy-prod.yml`, which calls the reusable `.github/workflows/deploy.yml`. Pull requests into `main` run `.github/workflows/pr-checks.yml`. There is one environment, `prod`.

| Item | Value |
| --- | --- |
| Hosting | AWS App Runner service `tw-spectrum-livepreview-prod`, TW non-Prod account, `us-east-1`, one instance |
| Image | ECR repository `tw-spectrum-livepreview-prod`, built from the Next.js standalone output |
| Runtime secrets | SSM Parameter Store `/tw/spectrum-livepreview/prod/*`, injected by App Runner |
| DNS and TLS | Route 53 zone `thrillworks.site`, App Runner managed certificate |

The pipeline reads these GitHub secrets:

| Secret | Use |
| --- | --- |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | Deploy credentials for the TW non-Prod account |
| `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ENVIRONMENT` | Space and environment, used at build time and at runtime |
| `CONTENTFUL_DELIVERY_TOKEN`, `CONTENTFUL_PREVIEW_TOKEN` | Content Delivery and Content Preview API tokens |
| `CONTENTFUL_PREVIEW_SECRET`, `CONTENTFUL_REVALIDATE_SECRET` | Optional. When unset, a value is generated once and kept in SSM |
| `BASIC_AUTH_PASSWORD` | Optional. When unset, a value is generated once and kept in SSM. The user is `spectrum`, or the `BASIC_AUTH_USER` variable |

Pages are prerendered from Contentful during the build, so a change to the space ID or delivery token needs a redeploy (re-run **Deploy Production** from the Actions tab). The service runs exactly one instance because the Next.js data cache is held on the instance, and a revalidation webhook reaches only one instance.

In Contentful, set the preview URL to `https://spectrum-livepreview.thrillworks.site/api/draft?secret=<CONTENTFUL_PREVIEW_SECRET>&slug={entry.fields.slug}`.

## Basic auth

The deployed site asks for a username and password (`proxy.ts`, `lib/basic-auth.ts`), so it is neither public nor crawlable. Three paths stay open because each has its own check or serves nothing private: `/robots.txt` (the App Runner health check), `/api/draft` (checks the preview secret) and `/api/revalidate` (checks the webhook secret).

The Contentful preview pane loads the site in a cross-site iframe. In a normal Chrome window the browser shows the password prompt inside the pane. In incognito, and in browsers that block third-party cookies, Chrome shows no prompt and the pane displays only "Authentication required." To cover those cases, the preview URL sets a `preview_access` cookie that the gate accepts instead of the password, and sets the draft mode cookie again. Both cookies are `Partitioned`, which browsers keep in a cross-site iframe even when third-party cookies are blocked. The access cookie is derived from the password, so changing `BASIC_AUTH_PASSWORD` revokes every issued cookie.
