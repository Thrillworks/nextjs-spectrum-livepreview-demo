#!/usr/bin/env bash
# Produces everything the Dockerfile copies. Shared by deploy.yml and pr-checks.yml
# so the PR gate builds exactly what a deploy would ship.
#
#   .next/standalone + .next/static   next build, standalone output
#
# Run from the repository root after `npm ci`: bash .github/scripts/build-image-context.sh
#
# The CONTENTFUL_* variables are read at build time as well as at runtime: pages are
# prerendered from Contentful during `next build`. Without them the build still
# succeeds, but the home page is prerendered as the "Connect Contentful" notice.
set -euo pipefail

export NEXT_OUTPUT_STANDALONE=1
export NEXT_TELEMETRY_DISABLED=1

npx next build

if [ ! -f .next/standalone/server.js ]; then
  echo "::error::next build did not emit .next/standalone/server.js - standalone output is not enabled (see next.config.ts)."
  exit 1
fi

mkdir -p public

echo "Image context ready: .next/standalone, .next/static, public"
