# Simple Create Link

現在のタブのURLとタイトルをHTML形式でクリップボードに保存するChrome拡張機能

以下のような形式でクリップボードに保存される。

```html
<a href="$url" target="_blank">$title</a>
```

## Install方法

1. `chrome://extensions/` にアクセス
2. 右上の「デベロッパーモード」をオンにする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. このリポジトリのルートディレクトリ（`manifest.json` がある場所）を選択

## 使い方

1. リンクを作成したいページで拡張機能のアイコンをクリック
2. 自動的に `<a href="URL" target="_blank">タイトル</a>` 形式でクリップボードにコピーされる

## 設定

拡張機能のアイコンを右クリックして「オプション」を開くと、次の設定ができる。変更はすぐに保存される。

- 出力形式: HTML / Markdown / URLのみ / タイトルのみ
- target（HTML のみ）: 指定しない / `_blank` / `_self`
- `rel="noopener noreferrer"` を付けるか（HTML のみ）
- タイトルの前後の空白を除き、連続する空白を1つにするか

初期値は `<a href="URL" target="_blank">タイトル</a>` 形式。

## URL

以下のページにGitHubのリポジトリがあります。

https://github.com/sunadarake/chrome-extension-create-links

## LICENCE

MIT

## 開発

```bash
npm install          # 依存のインストール
npm test             # テスト (vitest)
npm run lint         # ESLint
npm run typecheck    # 型チェック (tsc --checkJs)
npm run format       # Prettier で整形
./release.sh         # release/ に配布用 zip を作成
./publish.sh         # GitHub に Release を公開
```
