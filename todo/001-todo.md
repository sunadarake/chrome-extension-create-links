# 設計見直し・src/ 移行・テスト/lint 基盤の導入

## 概要
コードを `src/` に集約し、popup.js を責務ごとに分けてテストしやすくする。あわせて vitest・ESLint・Prettier・tsc(--checkJs) を導入し、テストを追加する。挙動（クリップボードへ `<a href="URL" target="_blank">タイトル</a>` をコピーして閉じる）は変えない。

## 調査結果
- 現状は直下に `manifest.json` / `popup.html` / `popup.css` / `popup.js` / `icons/` / `build.sh`。`package.json` なし。
- `popup.js` は1つの `DOMContentLoaded` ハンドラに、タブ取得・HTML生成・textarea によるコピー・メッセージ表示・自動クローズが全部入っている。`escapeHtml` だけ独立している。`chrome.tabs` と `document` を直接参照するためそのままではテストしにくい。
- コピーは `document.execCommand('copy')`。引き続き使う（AGENTS.md 記載の方針）。`navigator.clipboard` には変えない。
- `popup.js` のコメントは「1.5秒後」だが、実際の `setTimeout` は 500ms。コメントを実際の値に合わせて直す。
- `build.sh` は `.` 全体を zip 化し、`*.sh` / `screenshots/*` / `node_modules/*` などを除外している。`src/` 移行後は `src/` の中身だけを zip 化する形にする。
- `.gitignore` に `package-lock.json` がある。再現性のためロックファイルはコミットしたいので外す（懸念点参照）。
- `.claude/skills/`・`.opencode/commands/` は開発支援用で、今回の対象外。

## 実装計画
### 1. src/ への移行
- [x] `manifest.json` / `popup.html` / `popup.css` / `popup.js` / `icons/` を `git mv` で `src/` に移す（`src/manifest.json` など。パス参照は相対のまま変わらない）
- [x] `build.sh` を `src/` を zip 化する形に直す（`cd src && zip -r ../dist/<name>.zip .`。除外指定を整理。`<name>` は従来どおりプロジェクトのディレクトリ名）
- [ ] 拡張機能として `src/` を読み込み、従来どおり動くことを確認する（実機確認が必要。未実施）

### 2. 設計見直し（純粋関数への分離）
- [x] `src/lib/escape-html.js`: `escapeHtml(text)`（既存ロジックをそのまま移す）
- [x] `src/lib/create-link.js`: `createLinkHtml(url, title)`（エスケープ込みで `<a ...>` 文字列を返す純粋関数）
- [x] `src/lib/copy-text.js`: `copyText(text)`（textarea + `execCommand`。成功可否を boolean で返す）
- [x] `src/popup.js`: `run({ queryTabs, copy, messageEl, close })` を export。タブ取得 → リンク生成 → コピー → メッセージ表示 → 自動クローズを担当。`DOMContentLoaded` で実物の依存（`chrome.tabs.query`、`copyText`、`window.close`）を渡して呼ぶ
- [x] `popup.html` の script を `type="module"` にする
- [x] 自動クローズ待ち時間の定数とコメントを実際の 500ms に合わせる

### 3. ツール導入
- [x] `package.json` 作成（`"type": "module"`、private、scripts: `test` / `lint` / `format` / `typecheck`）
- [x] devDependencies: `vitest`、`jsdom`、`eslint`（+ `@eslint/js`、`globals`）、`prettier`、`eslint-config-prettier`、`typescript`、`@types/chrome`
- [x] `vitest.config.js`: 環境を `jsdom`、対象を `src/**/*.test.js`（テストは対象ファイルの隣に置く）
- [x] `eslint.config.js`（flat config）: ブラウザ + `chrome` グローバル、Prettier と競合するルールを無効化
- [x] `.prettierrc`: 既存コードに近い設定（シングルクォート・セミコロンあり・2スペース）
- [x] `jsconfig.json`（または `tsconfig.json`）: `checkJs: true`、`noEmit: true`、`src/` 対象。必要な JSDoc 型注釈を追加
- [x] `.gitignore` から `package-lock.json` を外し、`coverage/` を追加

### 4. テスト追加
- [x] `escape-html.test.js`: `& < > " '` の各変換、複数文字の混在、変換不要な文字列
- [x] `create-link.test.js`: 通常のURL/タイトル、タイトルに特殊文字（`<script>` や `"`）を含む場合にエスケープされること、`target="_blank"` 付きの形式
- [x] `copy-text.test.js`（jsdom）: `execCommand` をモックし、成功/失敗の戻り値、textarea が後始末（DOMから削除）されること
- [x] `popup.test.js`（jsdom）: 成功時に「コピーしました」を表示して close を呼ぶ／タブなし時に「エラー: タブが見つかりません」／コピー失敗時に「エラー: コピーに失敗しました」を表示し close を呼ばない（`queryTabs` / `copy` / `close` をモックして注入）

### 5. ドキュメント更新
- [x] `AGENTS.md` を更新（ディレクトリ構成、コマンド欄の `npm install` / `npm test` / `npm run lint` / `npm run typecheck` / ビルド、テストの置き場所）
- [x] `README.md` のインストール手順を「`src/` ディレクトリを選択」に直し、開発手順（テスト・lint）を追記
- [x] README は手で直した

## テスト・確認方法
- [x] `npm test` が全件通る
- [x] `npm run lint` が通る
- [x] `npm run typecheck` が通る
- [x] `npx prettier --check .` が通る
- [x] `./build.sh` で作った zip に `manifest.json` が直下にあり、`node_modules/` やテストファイルが含まれない
- [ ] （未実施）Chrome で `src/` を読み込み、実際にアイコンをクリックして、コピーされる内容と自動クローズが従来と同じである（手動）

## 決定事項
- 言語は JavaScript のまま（TypeScript 化しない）。型は JSDoc + `tsc --checkJs` で補う
- 追加ツールは vitest（jsdom）・ESLint・Prettier・tsc(--checkJs)。GitHub Actions CI は今回は入れない
- HTML/CSS・アイコン・JS は `src/` に置く。`manifest.json` はルートに置き、`src/` 内を参照する（後から変更）
- テスタビリティ改善は、純粋関数への分離と依存の注入で行い、ファイル数は最小限にとどめる
- ビルド工程（バンドラ）は導入しない。popup は ES Modules（`type="module"`）で読み込む

- パッケージマネージャーは npm、`package-lock.json` はコミットする（`.gitignore` から外した）
- `AGENTS.md` / `opencode.json` は既存の整形を変えないよう `.prettierignore` に入れた
- `popup.js` の `chrome.tabs.query` 結果は、activeTab で url/title が必ず取れる前提で JSDoc の型を絞った

## 懸念点・未決事項
- `.gitignore` の `package-lock.json` を外してよいか（再現性のためコミットを推奨）。AGENTS.md の「パッケージ管理」も npm と明記する
- パッケージマネージャーは npm を想定。pnpm 等がよければ変更する
- `type="module"` の popup が拡張機能で問題なく動くかは手動確認が必要（通常は動く）
- `execCommand` は非推奨 API だが、現行方針のため維持。置き換えは別タスク
