#!/bin/bash
# release/ の zip を GitHub Release として公開するスクリプト。
set -euo pipefail

version=$(jq -r .version manifest.json)
tag="v${version}"
app_name=$(basename "$PWD")
zip_path="release/${app_name}-v${version}.zip"

# Release を作ると tag は既定ブランチの先頭に付くため、
# 未コミット・未 push の内容が Release から漏れないようにする
if [ -n "$(git status --porcelain)" ]; then
  echo "エラー: コミットされていない変更があります" >&2
  exit 1
fi
if [ "$(git rev-parse HEAD)" != "$(git rev-parse '@{u}')" ]; then
  echo "エラー: push されていないコミットがあります" >&2
  exit 1
fi

if gh release view "$tag" >/dev/null 2>&1; then
  echo "エラー: ${tag} の Release は既に存在します" >&2
  exit 1
fi

./release.sh

notes=$(cat <<NOTES
## 概要
現在のタブのURLとタイトルを \`<a href="URL" target="_blank">タイトル</a>\` 形式でクリップボードにコピーするChrome拡張機能です。
アイコンをクリックするだけでコピーされ、ポップアップは自動で閉じます。

## インストール方法
1. 添付の \`${app_name}-v${version}.zip\` をダウンロードして展開する
2. \`chrome://extensions/\` を開き、右上の「デベロッパーモード」をオンにする
3. 「パッケージ化されていない拡張機能を読み込む」をクリックする
4. 展開したディレクトリ（\`manifest.json\` がある場所）を選択する
NOTES
)

gh release create "$tag" "$zip_path" --title "$tag" --notes "$notes"
