// import del from 'del';
import fs from 'fs';
import del from 'del';
import GMagickTask from './GMagickTask';
import Shell from './Shell';
let mkdirp = require('mkdirp');


export default class AppCommander {
  constructor(option, app) {
    this.app = app;
    // 末尾にスラッシュ不要
    this.workDir =  option.workDir ? option.workDir : './workdir';
    this.tmpPath  = option.tmpPath ? option.tmpPath : this.workDir + 'tmp' ;
    this.destPath = option.destPath ? option.destPath : this.workDir + 'dest';
    this.tmpImageFormat = option.tmpImageFormat ? option.tmpImageFormat : 'jpg';

    this.compareResultPath = this.tmpPath + '/compare_result';
    this.splitResultPath = this.tmpPath + '/split_result';
    this.splitCounter = '%03d';
    this.splitDensity = 150;
    this.compareStyle = option.compareStyle ? option.compareStyle : 'xor';
    this.resultFilePrefix = option.resultFilePrefix ? option.resultFilePrefix : 'result';
    this.busy = false;
  }

  runTask(target1, target2, outputDiffOnly = true, destPath = this.destPath) {
    this.initDir();
    return new Promise((resolve, reject) => {
      this.splitPdf(target1, 1).then(() => {
        console.log('step1');
        return this.splitPdf(target2, 2);
      }).then(() => {
        console.log('step2');
        return this.comparePreStep(this.splitResultPath);
      }).then((t1Page, t2Page) => {
        console.log('step3');
        return this.compareStep(this.splitResultPath, t1Page, t2Page, outputDiffOnly);
      }).catch(() => {
        console.log('step4');
        reject(new Error('差分を生成できませんでした。完全に同一の内容である可能性があります。'));
      }).then(() => {
        return this.combineToPdf(destPath);
      }).then(() => {
        this.clean(this.splitResultPath);
        this.clean(this.compareResultPath);
      });

    });
  }
  
  makedir(dirList) {
    dirList.forEach((item) => {
      mkdirp.sync(item);
    });
  }

  // ディレクトリを準備する
  initDir() {
    this.makedir([
      this.compareResultPath,
      this.splitResultPath + '/1',
      this.splitResultPath + '/2',
      this.destPath
    ]);
  }

  /**
   * ディレクトリの中身を消去
   * 
   * @method clean
   * @param dir {String}
   * @return {Array}
   */
  clean(dir) {
    return del.sync(dir + '/**', {force: true});
  }

  /**
   * ディレクトリからファイルの一覧を取得する
   *
   * @method readDir
   * @param dir {String}
   * @return {Array}
   */
  readDir(dir) {
    return fs.readdirSync(dir);
  }

  toggleBusySignal() {
    return this.busy = !this.busy;
  }
  
  startBusy() {
    return (this.busy === false) ? this.toggleBusySignal() : this.busy;
  }
  
  endBusy() {
    return (this.busy === true) ? this.toggleBusySignal() : this.busy;
  }

  /**
   * コマンドを実行する
   *
   * @method execCmd
   * @param cmds {Array}
   * @return {Object}
   */
  execCmd(cmds) {
    let result = {
      hasError: false,
      stdout: []
    };
    
    this.startBusy();

    cmds.forEach((cmd) => {
      try {
        let out = Shell.execFile(cmd);
        result.stdout.push(out);
        console.log(out);
      } catch (e) {
        result.stdout.push(e);
        result.hasError = true;
        console.error(e.cmd);
      }
    });

    this.endBusy();
    return result;
  }

  execAsync(cmd) {
    return Shell.execFile(cmd);
  }

  /**
   * 現在時刻を文字列で生成する
   *
   * @method genDateStr
   * @static
   * @return {String}
   */
  static genDateStr(date = new Date()) {
    let ary = [
      date.getFullYear(),
      date.getMonth() + 1, date.getDate(),
      date.getHours(), date.getMinutes(),
      date.getSeconds(), date.getMilliseconds()
    ];

    ary.forEach((number, index) => {
      if (number.toString().length === 1) {
        ary[index] = `0${ary[index]}`;
      }
    });
    return ary.join('_');
  }

  /**
   * PDF分割コマンドを実行
   *
   * @method splitPdf
   * @return {Promise}
   */
  splitPdf(targetFilePath, num) {
    return this.execAsync([GMagickTask.genCmdStr('splitPdf', {
      src: targetFilePath,
      dest: `${this.splitResultPath}/${num}/${this.splitCounter}.${this.tmpImageFormat}`,
      density: this.splitDensity
    })]);
  }

  /**
   * 比較結果画像をPDFに結合するコマンドを実行
   *
   * @method combinePdf
   * @return {Promise}
   */
  combineToPdf(dest) {
    return this.execAsync([GMagickTask.genCmdStr('combineImages', {
      src: this.compareResultPath,
      dest: `${dest}/${this.resultFilePrefix}_${AppCommander.genDateStr()}.pdf`
    })]);
  }

  comparePreStep(splitResultPath) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let t1Pages = this.readDir(`${splitResultPath}/1/`);
        let t2Pages = this.readDir(`${splitResultPath}/2/`);
        if (t1Pages.length <= 0 || t2Pages.length <= 0) {
          reject(new Error('No pages!'));
        }
        resolve(t1Pages, t2Pages);
      }, 10);
    });
  }

  // 比較ステップ
  compareStep(splitResultPath, t1Pages, t2Pages, outputDiffOnly) {
    let result = [];
    
    t1Pages.forEach((fileName, index) => {
      let path1 = `${splitResultPath}/1/${fileName}`;
      if (typeof t2Pages[index] === 'undefined') {
        console.info('No target2 page. Stop this process.');
      } else {
        let path2 = `${splitResultPath}/2/${t2Pages[index]}`;
        result.push({path1: path1, path2: path2});
      }
    });
    
    return result.reduce((sequence, item) => {
      return sequence.then(() => {
        return this.compareImage(item.path1, item.path2, outputDiffOnly);
      });
    }, Promise.resolve());
    
  }


  /**
   * 画像を比較するコマンドを実行
   *
   *
   */
  compareImage(target1, target2, diffOnly) {
    let type = this.compareStyle;
    let destPath = this.compareResultPath + '/' + this.genDateStr();

    // 差分があるファイルのみ画像を出力する
    return this.compareImageMetric(target1, target2)
      .then((target1, target2) => {
        return this.compareImageWithOutput(target1, target2, type, destPath)
    });
  }

  /**
   * 画像に差分がある場合はtrue, ない場合はfalse
   *
   * @method compareImageMetric
   * @param target1 {String}
   * @param target2 {String}
   * @return {Boolean}
   */
  compareImageMetric(target1, target2) {
    let cmd = GMagickTask.genCmdStr('compareImages', {
      src: target1,
      src2: target2,
      metricOnly: true
    });
    return new Promise((resolve, reject) => {
      this.execAsync([cmd])
        .then((stdout) => {
          if(GMagickTask.checkCompareResult(stdout)) {
            resolve()
          }
          reject(target1, target2);
        });
    });
    
  }

  /**
   * 画像の差分をファイルとして出力する
   *
   * @method compareImageMetric
   * @param target1 {String}
   * @param target2 {String}
   * @param type {String}
   * @param destPath {String}
   * @return {Object}
   */
  compareImageWithOutput(target1, target2, type, destPath) {
    let cmd = GMagickTask.genCmdStr('compareImages', {
      src: target1,
      src2: target2,
      metricOnly: false,
      dest: destPath,
      compareStyle: type
    });
    return this.execAsync([cmd]);
  }
}