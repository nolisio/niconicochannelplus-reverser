# Stereo Swap for nicochannel.jp
nicochannel.jp で再生される動画の左右オーディオチャンネルを、ワンクリックで入れ替える拡張機能です。
イヤホンの装着ミスや視聴環境による違和感をすばやく補正し、快適な視聴体験を提供します。

## できること
- nicochannel.jp の動画だけに限定して動作
- 左右チャンネルの入れ替えを即時に反映
- 有効/無効の状態を `chrome.storage.local` に保存

## 対応ブラウザ
- Google Chrome
- Microsoft Edge
- Chromium 系ブラウザ

## インストール方法（開発者モード）
1. このリポジトリをダウンロードまたは clone します。
2. ブラウザの拡張機能ページを開きます。
3. 開発者モードを有効化します。
4. 「パッケージ化されていない拡張機能を読み込む」を選択し、リポジトリのフォルダを指定します。

## 使い方
1. nicochannel.jp の動画ページを開きます。
2. 拡張機能のポップアップを開き、スイッチを ON にします。
3. 音声がすぐに切り替わらない場合は、ページ内を一度クリックしてください。
4. OFF にすると元のステレオ再生に戻ります。

## 権限と理由
- `storage`: 有効/無効の設定を `chrome.storage.local` に保存するために使用します。
- `https://nicochannel.jp/*`: 対象サイトの動画要素を検出し、ローカルで音声チャンネルを入れ替えるために使用します。

## プライバシー
この拡張機能は、音声・動画・個人情報を外部に送信しません。
公開版のプライバシーポリシーはこちらです。
https://nolisio.github.io/niconicochannelplus-reverser/privacy-policy.html

## 主要ファイル
- [manifest.json](manifest.json)
- [content.js](content.js)
- [popup.html](popup.html)
- [popup.js](popup.js)
- [privacy-policy.html](privacy-policy.html)

## パッケージング
Web Store 提出用 ZIP の作成方法は [webstore-assets/package.md](webstore-assets/package.md) を参照してください。

## 審査用メモ
ストア掲載文言やチェックリストは以下にまとめています。
- [webstore-assets/store-listing.md](webstore-assets/store-listing.md)
- [webstore-assets/submission-checklist.md](webstore-assets/submission-checklist.md)

## トラブルシュート
- 音が変わらない場合: ページ内を一度クリックして再生を開始し直してください。
- それでも変わらない場合: 拡張機能を OFF → ON で再度切り替えてください。
