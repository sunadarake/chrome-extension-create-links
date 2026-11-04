# オプションページの追加（出力形式・target・rel・タイトル整形）

## 概要
リンクの作り方を利用者が設定できるオプションページを追加する。設定は `chrome.storage.local` に保存し、ポップアップがコピーするときに読み込む。初期値は現行の出力（`<a href="URL" target="_blank">タイトル</a>`）と同じにして、設定を触らなければ挙動は変わらない。

## 調査結果
- `src/popup.js`: `run({ queryTabs, copy, messageEl, close })` が タブ取得 → `createLinkHtml(url, title)` → コピー → 表示 → 自動クローズ。依存は `run` に注入している。
- `src/lib/create-link.js`: `createLinkHtml(url, title)` が `target="_blank"` 固定の `<a>` を返す。`escapeHtml` でエスケープ済み。
- `manifest.json`（ルート）: 権限は `activeTab` のみ。`action.default_popup` は `src/popup.html`。`options_ui` は未定義。
- テストは対象ファイルの隣に `*.test.js`（vitest + jsdom）。`@types/chrome` は導入済みなので `chrome.storage` の型は使える。
- `release.sh` は `manifest.json` と `icons/` と `src/` を zip 化するので、`src/` に置けば配布物に入る。

## 実装計画
### 1. 設定の定義と保存
- [x] `src/lib/options.js` を新規作成
  - `DEFAULT_OPTIONS = { format: 'html', target: '_blank', noopener: false, tidyTitle: false }`
  - `format`: `'html' | 'markdown' | 'url' | 'title'`、`target`: `'' | '_blank' | '_self'`（`''` は target 属性を出さない）、`noopener`: `rel="noopener noreferrer"` を付けるか、`tidyTitle`: タイトルを整形するか（JSDoc の `@typedef Options` で型を定義）
  - `loadOptions()`: `chrome.storage.local.get(DEFAULT_OPTIONS)` の結果を返す（未保存の項目は初期値になる）
  - `saveOptions(options)`: `chrome.storage.local.set(options)`
- [x] `manifest.json` の `permissions` に `storage` を追加（`["activeTab", "storage"]`）

### 2. リンク生成の拡張
- [x] `src/lib/create-link.js` の `createLinkHtml(url, title)` を `createLink(url, title, options)` に変更して形式ごとに分岐する（1か所でしか使わない分岐用のヘルパーは作らず、1つの関数で書く）
  - `html`: `<a href="URL"[ target="..."][ rel="noopener noreferrer"]>タイトル</a>`。URL とタイトルは必ず `escapeHtml` を通す
  - `markdown`: `[タイトル](URL)`。タイトル中の `[` `]` と、URL 中の `(` `)` をバックスラッシュ等でエスケープする（下の懸念点参照）
  - `url`: URL のみ、`title`: タイトルのみ（どちらもエスケープしない。プレーンテキストのため）
  - `tidyTitle` が true のとき、タイトルの前後の空白を除き、連続する空白・改行を1つの半角スペースにする
- [x] 呼び出し側（`popup.js`）を `createLink` に差し替え、`createLinkHtml` の名前は残さない

### 3. ポップアップ側
- [x] `src/popup.js`: `run` の依存に `loadOptions` を追加し、タブ取得と同時に設定を読み込んで `createLink(tab.url, tab.title, options)` に渡す。`DOMContentLoaded` の注入部で `loadOptions` を渡す
- [x] `src/popup.test.js` を更新（設定を注入して形式が反映されること）

### 4. オプションページ
- [x] `src/options.html` / `src/options.css` / `src/options.js` を新規作成
  - 出力形式: ラジオ（HTML / Markdown / URLのみ / タイトルのみ）
  - target: プルダウン（指定なし / `_blank` / `_self`）。出力形式が HTML 以外のときは無効化する
  - rel: チェックボックス「`rel="noopener noreferrer"` を付ける」。HTML 以外では無効化
  - タイトルを整形する: チェックボックス（前後の空白除去と連続空白の圧縮）
  - 現在の出力例のプレビュー（サンプルURL/タイトルに `createLink` を適用して表示）
  - 変更したら即保存（保存ボタンなし）し、「保存しました」を表示。「初期値に戻す」ボタンを付ける
  - ロジックは `options.js` の `init({ load, save, root })` のように依存を注入する形にして、popup.js と同じ作りにする
- [x] `manifest.json` に `"options_ui": { "page": "src/options.html", "open_in_tab": true }` を追加
- [x] ポップアップにはオプションへのリンクは付けない（自動で閉じる仕様のため）。拡張機能アイコンの右クリック「オプション」から開く

### 5. テスト
- [x] `src/lib/create-link.test.js`: 形式ごとの出力、target 3パターン、rel の有無、特殊文字のエスケープ（HTML と Markdown）、タイトル整形の on/off
- [x] `src/lib/options.test.js`: `chrome.storage.local` をモックし、`loadOptions` が初期値で補われること、`saveOptions` が保存すること
- [x] `src/options.test.js`（jsdom）: 読み込んだ値が画面に反映されること、変更で `save` が呼ばれること、HTML 以外で target/rel が無効になること、初期値に戻すこと、プレビューが更新されること
- [x] `src/popup.test.js`: 設定により Markdown / URL のみがコピーされること

### 6. ドキュメント
- [x] `AGENTS.md`: 概要（設定でリンク形式を変えられる）、権限（`activeTab` と `storage`）、ディレクトリ構成（`options.html` / `options.js` / `options.css`、`lib/options.js`）、「URLとタイトルは `escapeHtml` でエスケープ」の規約を `createLink` に合わせて更新
- [x] `README.md`: オプションページの開き方と設定項目を追記

### 7. メッセージの色と絵文字（追加依頼）
- [x] `src/popup.js`: 成功は「✅ コピーしました」、エラーは「❌ エラー: ...」と表示し、`messageEl` に `success` / `error` クラスを付ける
- [x] `src/popup.css`: `.success` を緑、`.error` を赤にする
- [x] `src/popup.test.js`: 表示文言とクラスの期待値を更新する

## テスト・確認方法
- [x] `npm test` が全件通る
- [x] `npm run lint` が通る
- [x] `npm run typecheck` が通る
- [x] `npx prettier --check .` が通る
- [ ] （手動）Chrome で読み込み、アイコン右クリック →「オプション」でページが開く
- [ ] （手動）設定を変えて保存し、ポップアップでコピーした内容が設定どおりになる（HTML / Markdown / URL / タイトル、target、rel、整形）
- [ ] （手動）設定を触っていない状態で、従来と同じ `<a href="URL" target="_blank">タイトル</a>` がコピーされる
- [ ] （手動）ブラウザを再起動しても設定が残っている

## 決定事項
- 出力形式は HTML `<a>`（現行）、Markdown、URLのみ、タイトルのみの4つ
- target は「指定なし / `_blank` / `_self`」から選ぶ。初期値は `_blank`（現行どおり）。HTML 形式のときだけ有効
- リンクの作り方として、`rel="noopener noreferrer"` の有無と、タイトルの整形を設定にする。URL のクエリ除去とテンプレートの自由記述は今回は入れない
- 保存先は `chrome.storage.local`（端末ごと。同期しない）。`storage` 権限を追加する
- 初期値は現行の出力と同じにする（rel なし、整形なし）
- 変更は即保存。保存ボタンは置かない

## 懸念点・未決事項
- 「タイトルの整形」は、前後の空白除去と連続空白の圧縮だけにした。サイト名の除去（`- YouTube` など）は判断が難しいので入れていない。必要なら別途相談
- Markdown のエスケープは最小限（タイトルの `[` `]`、URL の `(` `)` と空白）にする。完全な Markdown エスケープまではしない
- `activeTab` のみの方針に `storage` が加わる。AGENTS.md の技術スタック欄の記述を直す必要がある
- オプションページの見た目は `popup.css` に近い素朴なものにする。凝らない
