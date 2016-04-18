# image-compare-electron

GraphicsMagickにあるcompareコマンドのGUIフロントエンドです。
PDFの差分比較をDesktopに出力します。
child_process.execSyncを使っている関係で、asarでのパッケージ化に対応していません。
MacOSXでのみ動作します。

## スクリーンショット

![2016-04-18 17 00 23](https://cloud.githubusercontent.com/assets/6197292/14597347/0cec4b56-0587-11e6-9fef-54da2295d091.png)

## 出力PDFサンプル

![2016-04-18 17 03 17](https://cloud.githubusercontent.com/assets/6197292/14597421/7c131d02-0587-11e6-82c9-14a7a7470c98.png)

ソースPDFを1ページづつ分解して比較し、差分箇所をハイライトしたPDFを~/Desktopに生成します。

## 依存ソフト

graphicsmagickとghostscriptが必要です。

```
brew install graphicsmagick ghostscript
```

## 実行方法

```
cd image-compare-electron
npm i
gulp build
cd public/app
electron .
```
