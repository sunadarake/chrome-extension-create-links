# Simple Create Link

現在のタブのURLとタイトルを `<a href="URL" target="_blank">タイトル</a>` 形式でクリップボードにコピーするChrome拡張機能（Manifest V3）。
拡張機能のアイコンをクリックするとポップアップが開き、コピー後に自動で閉じる。

## 技術スタック
- 言語: JavaScript（ES Modules。バンドラなし、型は JSDoc + `tsc --checkJs`）
- フレームワーク: なし（Chrome Extension Manifest V3、権限は `activeTab` のみ）
- パッケージ管理: npm（開発用ツールのみ。拡張機能本体に外部ライブラリはない）
- 開発ツール: vitest（jsdom）、ESLint、Prettier、TypeScript（型チェックのみ）

## コマンド
- セットアップ: `npm install`
- テスト: `npm test`（テストは対象ファイルの隣に `*.test.js` で置く）
- lint: `npm run lint`（整形の確認は `npx prettier --check .`、整形は `npm run format`）
- 型チェック: `npm run typecheck`
- リリース: `./release.sh`（`manifest.json` と `icons/` と `src/` を `release/<ディレクトリ名>-v<version>.zip` にする。version は `manifest.json` から取る）
- 投稿: `./publish.sh`（zip を GitHub に draft の Release として投稿する。外部への投稿なので実行前にユーザーに確認する。コミット・push 済みでないと止まる）
- 動作確認: `chrome://extensions/` でリポジトリのルートを「パッケージ化されていない拡張機能」として読み込む

## ディレクトリ構成
- `manifest.json` 拡張機能の定義（ルートに置く。`src/` と `icons/` を参照する）
- `icons/` アイコン
- `src/` 拡張機能のコード
  - `popup.html` / `popup.css` ポップアップの画面
  - `popup.js` 処理の流れ（`run` に依存を渡して呼ぶ。Chrome APIやDOMへの依存はここで注入する）
  - `lib/` 純粋関数など（`escape-html.js`、`create-link.js`、`copy-text.js`）
- `screenshots/` README用の画像
- `release.sh` / `publish.sh` 配布用zipの作成と、GitHub Release への投稿スクリプト
- `todo/` 実装計画（`/todo-plan` で作成、`/todo-refine` で詰める、`NNN-todo.md` 形式）
- `.claude/skills/` と `.opencode/commands/` 開発支援用のスキル・コマンド定義（拡張機能の本体ではない）

## 作業の進め方
- 作業の前に、関連するコードと仕様を読んで理解する
- 不明点や判断が分かれる点は、推測で進めずに質問する
- 依頼された範囲だけを変更する。範囲外で必要な変更に気づいたら報告する
- 作業の完了前に、テスト・lint・型チェックを実行して通ることを確認する

## コーディング規約
- 既存コードの書き方（命名、構成、エラー処理）に合わせる
- コードはシンプルにする。1か所でしか使わない抽象化やヘルパー関数は作らない
- コメントは日本語（UTF-8）で、コードを読んでも分からない「なぜ」だけを書く
- 不要な防御処理（過剰なnullチェック、エラーの握りつぶし）を書かない
- 使わなくなったコード、デバッグ用のログは残さない
- コピーは `navigator.clipboard` ではなく、textareaと `document.execCommand('copy')` で行っている。ポップアップ内で確実にコピーするためなので、変える場合は実機で動作確認する
- URLとタイトルは `escapeHtml` でエスケープしてからHTMLに埋め込む（`createLinkHtml` を使う）

## コミット
- メッセージは日本語で、1行目は変更内容が一目で分かる50文字程度にする
- 必要な場合のみ、空行のあとに補足を書く
- 署名・クレジット行（`Co-Authored-By` など）は含めない

## 禁止事項
- `.env`、認証情報、秘密鍵をコミットしない
- `git push`、`git reset --hard`、強制的な上書きをしない
- テストを通すためにテストを弱めたり、無効にしたりしない
- `release/` や `*.zip` などのビルド成果物をコミットしない
- `package-lock.json` はコミットする（`.gitignore` に入れない）
