const bin = 'gm';
const gmConvert = `${bin} convert`;
const gmCompare = `${bin} compare`;
const pdfExt = /\.pdf$/;

let _checkRegex = (path, regex) => {
  if (typeof path === 'undefined') {
    throw new Error('Param must not be empty!');
  }
  let result = path.match(regex);
  return result !== null;
};

/**
 * 文字列の末尾に".pdf"が含まれるかどうかをチェックする
 *
 * @return {Boolean}
 */
let _checkPdfExt = (path) => {
  return _checkRegex(path, pdfExt);
};

/**
 * 文字列の末尾に"/"が含まれるかどうかをチェックする
 *
 * @return {Boolean}
 */
let _checkEndSlash = (path) => {
  return _checkRegex(path, /\/$/);
};

export default class GMagick {

  /**
   * メインのAPI。受け取った文字列と同じ名前のメソッドに引数を渡す
   * 返り値はコマンド文字列
   *
   * @method getCommand
   * @static
   * @param type {String}
   * @param args {Array}
   * @return {String}
   */
  static getCommand(type, ...args) {
    return GMagick[`get${type}`](...args);
  }

  /**
   * 画像比較コマンド文字列を返す
   *
   * @method getCompare
   * @static
   * @param targetPath1 {String} 差分の比較元1
   * @param targetPath2 {String} 差分の比較元2
   * @param metricOnly {Boolean} [option] 解析結果だけを返す。デフォルトはtrue
   * @param outputPath {String} 結果を出力するパス
   * @param compareStyle {String} [option] 画像比較の表現。デフォルトは'xor'
   * @return {String} コマンド
   */
  static getCompare(targetPath1, targetPath2, metricOnly = false, outputPath = '', compareStyle = 'xor') {
    let additionalOption;

    if (metricOnly === true) {
      additionalOption = ' -metric MAE'
    }

    if (metricOnly === false) {
      additionalOption = ` -file ${outputPath}`;
    }

    return `${gmCompare} -highlight-style ${compareStyle}${additionalOption} ${targetPath1} ${targetPath2}`;
  }

  /**
   * 画像を結合して1つのPDFにする
   *
   * @method getCombine
   * @static
   * @param inputDir {String}
   * @param outputPath {String}
   */
  static getCombine(inputDir, outputPath) {
    if (_checkPdfExt(outputPath) === false) {
      throw new Error('param "outputPath" must be a PDF file');
    }
    if (_checkEndSlash(inputDir) === false) {
      inputDir = inputDir + '/';
    }
    return `${gmConvert} ${inputDir}* ${outputPath}`;
  }

  /**
   * PDFを分割して複数のファイルにする
   *
   * @method getSplit
   * @static
   * @param inputFile {String}
   * @param outputFilePath {String}
   */
  static getSplit(inputFile, outputFilePath, density = 150) {
    if (_checkPdfExt(inputFile) === false) {
      throw new Error('param "inputFile" must be a PDF file');
    }
    return `${gmConvert} -density ${density}x${density} ${inputFile} +adjoin ${outputFilePath}`;
  }
}