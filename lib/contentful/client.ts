const space = process.env.CONTENTFUL_SPACE_ID;
const environment = process.env.CONTENTFUL_ENVIRONMENT ?? "master";
const deliveryToken = process.env.CONTENTFUL_DELIVERY_TOKEN;
const previewToken = process.env.CONTENTFUL_PREVIEW_TOKEN;

export const isContentfulConfigured = Boolean(space && deliveryToken);

type GraphQLResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

// Preview requests use the preview token so draft (unpublished) entries show
// up. The query must also pass `preview: true` to its collections.
export async function contentfulGraphQL<T>(
  query: string,
  variables: Record<string, unknown>,
  preview: boolean,
): Promise<T> {
  if (!space || !deliveryToken) {
    throw new Error(
      "Contentful is not configured. Copy .env.example to .env.local and fill in your space credentials.",
    );
  }

  const usePreview = preview && Boolean(previewToken);

  const res = await fetch(
    `https://graphql.contentful.com/content/v1/spaces/${space}/environments/${environment}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${usePreview ? previewToken : deliveryToken}`,
      },
      body: JSON.stringify({ query, variables: { ...variables, preview: usePreview } }),
    },
  );

  // GraphQL errors can come back with a 200, so check the body as well.
  const json = (await res.json()) as GraphQLResponse<T>;
  if (!res.ok || json.errors?.length || !json.data) {
    const messages = json.errors?.map((error) => error.message).join("; ");
    throw new Error(`Contentful GraphQL request failed (${res.status}): ${messages ?? res.statusText}`);
  }

  return json.data;
}
