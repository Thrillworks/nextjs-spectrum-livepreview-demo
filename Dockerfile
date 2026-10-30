# Runtime image for the Next.js standalone server.
#
# The build (npm ci + next build) runs in the GitHub Actions runner, so build
# tooling and build-time values never enter an image layer. This image only
# packages the produced artefacts and runs them. Runtime secrets (Contentful
# tokens, preview and revalidate secrets) are injected by App Runner from SSM
# Parameter Store as environment variables, not baked in.
#
# Expected build context, produced by .github/scripts/build-image-context.sh:
#   .next/standalone/          next build with output: "standalone"
#   .next/static/              client assets
#   public/                    static files
#
# Debian slim rather than Alpine: the runner builds on glibc, and next/image
# uses the glibc sharp binary that npm installed there.
FROM node:24-slim AS runner

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000

# Run as an unprivileged user.
RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

# Next.js standalone output bundles a minimal server + its own node_modules.
COPY --chown=nextjs:nodejs .next/standalone ./
COPY --chown=nextjs:nodejs .next/static ./.next/static
COPY --chown=nextjs:nodejs public ./public

USER nextjs

EXPOSE 3000

# HOSTNAME is forced inline: the Next.js standalone server binds to
# process.env.HOSTNAME, and container runtimes (App Runner/ECS/Docker) inject
# HOSTNAME=<container hostname>, which would make it bind to a single internal
# interface instead of all interfaces and break health checks.
CMD ["sh", "-c", "HOSTNAME=0.0.0.0 exec node server.js"]
