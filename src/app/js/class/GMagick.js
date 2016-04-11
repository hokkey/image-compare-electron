const bin = 'gm';
const gmConvert = `${bin} convert`;
const gmCompare = `${bin} compare`;

export default class GMagick {
  static getCommand(type, ...args) {
    return GMagick[`get${type}`](...args);
  }
  
  static getCompare(compareStyle, outputPath, targetPath1, targetPath2) {
    return `${gmCompare} -highlight-style ${compareStyle} -file ${outputPath} ${targetPath1} ${targetPath2}`;
  }

  static getCombine(inputDir, outputPath) {
    return `${gmCompare} ${inputDir}/* ${outputPath}`;
  }

  static getDevide(input) {
    return '';
  }
}