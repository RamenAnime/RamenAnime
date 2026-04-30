#!/bin/bash
set -e

echo "================================"
echo "  Ramen Anime — Render Deploy"
echo "================================"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "→ Initializing Git repository..."
    git init
    git branch -M main
fi

# Check if remote exists
if ! git remote get-url origin >/dev/null 2>&1; then
    echo ""
    echo "⚠️  GitHub remote not found."
    echo "   1. Go to https://github.com/new"
    echo "   2. Create a repo named 'ramen-anime' (or any name)"
    echo "   3. Do NOT add a README or .gitignore on GitHub"
    echo ""
    read -p "   Paste your GitHub repo URL here: " REPO_URL
    git remote add origin "$REPO_URL"
fi

echo "→ Adding all files..."
git add .

echo "→ Committing..."
git commit -m "Production build — render deployment ready" || true

echo "→ Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Code pushed to GitHub!"
echo ""
echo "Next steps:"
echo "  1. Go to https://dashboard.render.com"
echo "  2. Click 'New +' → 'Blueprint'"
echo "  3. Select your 'ramen-anime' repo"
echo "  4. Add environment variables (see RENDER_DEPLOY.md)"
echo "  5. Click 'Apply' and wait 3-5 minutes"
echo ""
echo "📖 Full guide: RENDER_DEPLOY.md"
