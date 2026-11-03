# release.sh / publish.sh の作成

## 概要
配布用 zip を `release/` に作る `release.sh` と、その zip を GitHub Release に draft で投稿する `publish.sh` を作る。Release Note には拡張機能の概要（2〜3行）とインストール方法を載せる。zip 作成は `release.sh` に一本化し、既存の `build.sh` は削除する。

## 調査結果
- `build.sh`: `manifest.json` と `src/` を `dist/<ディレクトリ名>.zip` にする（テストファイル除外）。README と AGENTS.md に記述がある。`dist/` は `.gitignore` 済み。
- `manifest.json`: `version` は `1.0.0`。zip の直下に `manifest.json` が来る構成。
- リモートは `origin`（`sunadarake/chrome-extension-create-links`）。タグはまだない。
- `gh`（認証済み）、`jq`、`zip` は導入済み。
- 拡張機能の概要は README 冒頭の文と同じ内容でよい。インストール方法は README の手順（開発者モード → パッケージ化されていない拡張機能を読み込む）を zip 展開版に直したもの。

## 実装計画
- [x] `release.sh` を作成（実行権限付き）
  - `set -euo pipefail`。`jq -r .version manifest.json` でバージョンを取得
  - `release/` を作り直し（既存の中身は削除）、`release/<ディレクトリ名>-v<version>.zip` を作成
  - 圧縮対象は `build.sh` と同じ（`manifest.json` と `src/`、`*.test.js` と `.DS_Store` は除外）
  - 作成した zip のパスを表示
- [x] `publish.sh` を作成（実行権限付き）
  - `set -euo pipefail`。先頭で `gh` と `jq` の存在、`gh auth status` を確認
  - 最初に `./release.sh` を実行して zip を最新にし、バージョンから tag（`v<version>`）を決める
  - `gh release view <tag>` が成功する（Release が既にある）場合はエラーで終了
  - Release Note をスクリプト内のテンプレートから生成する（概要2〜3行 + インストール方法。バージョンだけ差し込む）
  - `gh release create <tag> <zip> --draft --title <tag> --notes "<本文>"` を実行
  - 作成された draft の URL を表示する
- [x] `build.sh` を `git rm` で削除
- [x] `.gitignore`: `dist/` を `release/` に置き換える
- [x] `README.md`: 「開発」の `./build.sh` の行を `./release.sh`（zip を `release/` に作成）と `./publish.sh`（GitHub に draft Release を作成）に直す
- [x] `AGENTS.md`: ビルドのコマンド、ディレクトリ構成（`build.sh` → `release.sh` / `publish.sh`）、禁止事項の `dist/` を `release/` に直す。`publish.sh` は GitHub に投稿する操作なので、実行前にユーザーに確認することを注意点として書く
- [x] `todo/001-todo.md` の `build.sh` の記述はそのまま（過去の計画のため触らない）

## Release Note（テンプレート案）
```
## 概要
現在のタブのURLとタイトルを `<a href="URL" target="_blank">タイトル</a>` 形式でクリップボードにコピーするChrome拡張機能です。
アイコンをクリックするだけでコピーされ、ポップアップは自動で閉じます。

## インストール方法
1. 添付の `<name>-v<version>.zip` をダウンロードして展開する
2. `chrome://extensions/` を開き、右上の「デベロッパーモード」をオンにする
3. 「パッケージ化されていない拡張機能を読み込む」をクリックする
4. 展開したディレクトリ（`manifest.json` がある場所）を選択する
```

## テスト・確認方法
- [x] `./release.sh` で `release/chrome-extension-create-links-v1.0.0.zip` ができ、`manifest.json` が直下にあり、テストファイルを含まない
- [x] `./release.sh` を 2 回実行しても `release/` に古い zip が残らない
- [x] `shellcheck release.sh publish.sh` が通る（導入されていなければ `bash -n` で構文確認）
- [ ] （未実施） `publish.sh` は実際に GitHub へ投稿するため、実行はユーザーが行う。実行後、draft が作成され、zip が添付され、Release Note の表示が正しいことを GitHub 上で確認する（確認後、不要なら draft を手動で削除）
- [ ] （未実施） 同じ tag で `publish.sh` を再実行するとエラーで止まる
- [x] `npm test` / `npm run lint` / `npx prettier --check .` が通る（シェルスクリプトは対象外）

## 決定事項
- zip 作成は `release.sh` に一本化し、`build.sh` は削除する（出力先は `release/`）
- 版は `manifest.json` の `version` から決める。tag は `v<version>`、zip 名は `<ディレクトリ名>-v<version>.zip`
- Release Note はスクリプトが自動生成する（バージョンだけ差し込む。ファイルは持たない）
- 同じ tag の Release が既にある場合は、何もせずエラーで止める

- `publish.sh` に、未コミットの変更と未 push のコミットがあればエラーで止める確認を入れる（`git status --porcelain` と `HEAD` / `@{u}` の比較）

## 懸念点・未決事項
- draft の Release は、公開するまで tag が作られない。公開時の tag は GitHub 側で既定ブランチの先頭に作られるため、未 push のコミットは含まれない。`publish.sh` では未コミットの変更と未 push のコミットがあれば警告して止めるのが安全だが、計画に含めるか（含める場合は実装前に確認）
- `publish.sh` 内で `npm test` や lint を実行して品質確認するかは未定（今回は含めない想定）
- Release Note に変更内容（what's new）は載せない。必要になったら draft を GitHub 上で手動編集する
