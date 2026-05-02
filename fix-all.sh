#!/bin/bash
set -e
cd ~/RamenAnime

echo "[1/6] Fixing i18n.ts nav keys..."
sed -i 's/brand: '\''Home'\''/brand: '\''ラーメンアニメ'\''/' src/i18n.ts 2>/dev/null || true

echo "[2/6] Fixing Profile.tsx..."
