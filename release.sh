#!/bin/bash
# 配布用の zip ファイルを release/ に作成するスクリプト。
# manifest.json の version を zip 名に使う。
set -euo pipefail

version=$(jq -r .version manifest.json)
app_name=$(basename "$PWD")
zip_path="release/${app_name}-v${version}.zip"

# 古い zip が残らないように作り直す
rm -rf release
mkdir -p release

# manifest.json と icons/ と src/ を zip に圧縮（テストファイルは含めない）
zip -r "$zip_path" manifest.json icons src -x "*.test.js" "*.DS_Store"

echo "✓ ${zip_path} が作成されました"
