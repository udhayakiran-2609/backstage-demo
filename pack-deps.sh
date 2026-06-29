#!/bin/bash
set -euo pipefail

OUTPUT_DIR="$(pwd)/dynamic-plugins-root"

echo "🧹  Cleaning output dir..."
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

echo "📦  Bundling frontend: banner-admin..."
(cd plugins/banner-admin && yarn backstage-cli package bundle \
  --output-destination "$OUTPUT_DIR")

echo "📦  Bundling backend: banner-admin-backend..."
(cd plugins/banner-admin-backend && yarn backstage-cli package bundle \
  --output-destination "$OUTPUT_DIR")

echo ""
echo "✅  Done. Contents of dynamic-plugins-root:"
ls -1 "$OUTPUT_DIR"