# image-compare-electron

GraphicsMagickにあるcompareコマンドのGUIフロントエンドです。
PDFの差分比較をDesktopに出力します。
child_process.execSyncを使っている関係で、asarでのパッケージ化に対応していません。
MacOSXでのみ動作します。

![2016-04-18 17 00 23](https://cloud.githubusercontent.com/assets/6197292/14597347/0cec4b56-0587-11e6-9fef-54da2295d091.png)


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
