import GMagickTask from './GMagickTask';
import Shell from './Shell';

export default class AppCommander {
  constructor() {
    this.workDir = '/Users/hori_yuma/Desktop/workdir';
    this.src = 'src';
    this.tmp = 'tmp';
    this.dest = 'dest';
    this.splitCounter = '%03d';
  }
  
  cleanTmpDir() {

  }

  combinePdf(targetFilePath) {
    GMagickTask.genCmdStr('combinePdf', {
      src: target,
      dest: `${this.workDir}/${this.dest}/`
    });

    try {
      console.log(Shell.exec(cmd));
    } catch (e) {
      console.error(e);
    }
  }

  splitPdf(targetFileName) {

    let list = [
      {
        src: `${this.workDir}/${this.src}/1/${targetFileName}`,
        dest: `${this.workDir}/${this.src}/1/${targetFileName}_${splitCounter}.jpg`
      },
      {
        src: `${this.workDir}/${this.src}/2/${targetFileName}`,
        dest: `${this.workDir}/${this.src}/2/${targetFileName}_${splitCounter}.jpg`
      }
    ];

    GMagickTask.genCmdStr('splitPdf', list).forEach((cmd) => {
      try {
        console.log(Shell.exec(cmd));
      } catch (e) {
        console.error(e);
      }
    });
  }
}