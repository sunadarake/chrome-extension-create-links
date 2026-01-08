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
4. このディレクトリを選択

## 使い方

1. リンクを作成したいページで拡張機能のアイコンをクリック
2. 自動的に `<a href="URL" target="_blank">タイトル</a>` 形式でクリップボードにコピーされる
