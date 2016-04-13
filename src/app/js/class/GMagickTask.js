import GMagick from './GMagick';

export default class GMagickTask {
  
  static genCmdStr(taskType, options) {
    switch (taskType) {

    case 'splitPdf':
      return this.splitPdfTask(options);
      break;
    
    case 'splitPdfs':
      return this.splitPdfTasks(options);
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
  
  static splitPdfTask(options) {
    let result = [];

    // optionsは配列
    /* options = [
      {
        src:  './pdf_1/target.pdf',
        dest: './temp/1/target_%03d.jpg'
      };
    ]; */
    options.forEach((item) => {
      result.push(GMagick.getCommand('Split', item.src, item.dest));
    });

    return result;
  }
}