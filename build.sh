#!/bin/bash
# Chrome Extensionのビルドを行うスクリプト。
# zip ファイルを作成する。
#

# distディレクトリを作成（既存の場合は削除して再作成）
rm -rf dist
mkdir -p dist

# 親ディレクトリ名を取得
app_name=$(basename "$PWD")

# 拡張機能のファイルをzipに圧縮
zip -r "dist/${app_name}.zip" . -x                     \
    "*.git*" "*.DS_Store" ".gitattribute" ".gitignore" \
    "node_modules/*" "*.sh" "dist/*" "screenshots/*"

echo "✓ dist/${app_name}.zip が作成されました"