import GMagick from './GMagick';

const diffPattern = /0\.0000000000/g;

export default class GMagickTask {
  
  static genCmdStr(taskType, options) {
    switch (taskType) {

    case 'splitPdf':
      return this.splitPdfTask(options);
      break;

    case 'combineImages':
      return this.combineImagesTask(options);
      break;

    case 'compareImages':
      return this.compareImagesTask(options);
      break;

    default:
      throw new Error('unexpected "taskType" value!');
    }
  }
  
  static splitPdfTask(option) {
    return GMagick.getCommand('Split', option.src, option.dest, option.density);
  }
  
  static combineImagesTask(option) {
    return GMagick.getCommand('Combine', option.src, option.dest);
  }
  
  static compareImagesTask(option) {
    return GMagick.getCommand('Compare', option.src, option.src2, option.metricOnly, option.dest, option.compareStyle);
  }

  /**
   * 差分がある時にtrue, 差分がない時にfalse
   *
   *
   */
  static checkCompareResult(input) {
    let result = input.match(diffPattern);
    if (result === null) {
      return true;
    }
    // 結果に差分ゼロが3回(Red/Green/Blue)以上登場したら差分なし
    return (!result.length >= 3);
  }
}