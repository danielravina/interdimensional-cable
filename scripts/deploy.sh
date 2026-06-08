#!/bin/bash
set -e

echo "Building..."
GITHUB_PAGES=true NEXT_PUBLIC_BASE_PATH=/interdimensional-cable npm run build

echo "Deploying to gh-pages..."
TEMP_DIR=$(mktemp -d)
cp -r out/* "$TEMP_DIR/"
cp out/.nojekyll "$TEMP_DIR/" 2>/dev/null || true

cd "$TEMP_DIR"
git init
git config commit.gpgsign false
git checkout -b gh-pages
git add .
git commit -m "deploy $(date +%Y-%m-%d-%H%M%S)"
git remote add origin git@github.com:mrslop123/interdimensional-cable.git
git push origin gh-pages --force
cd -
rm -rf "$TEMP_DIR"

echo "Deployed."
