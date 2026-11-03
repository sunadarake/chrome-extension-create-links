#!/bin/bash
# Chrome Extensionのビルドを行うスクリプト。
# manifest.json と src/ を zip ファイルにする。
#

# distディレクトリを作成（既存の場合は削除して再作成）
rm -rf dist
mkdir -p dist

# プロジェクトのディレクトリ名を取得
app_name=$(basename "$PWD")

# 拡張機能のファイルをzipに圧縮（テストファイルは含めない）
zip -r "dist/${app_name}.zip" manifest.json src -x "*.test.js" "*.DS_Store"

echo "✓ dist/${app_name}.zip が作成されました"
