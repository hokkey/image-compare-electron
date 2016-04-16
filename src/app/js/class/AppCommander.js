// import del from 'del';
import fs from 'fs';
import del from 'del';
import GMagickTask from './GMagickTask';
import Shell from './Shell';

export default class AppCommander {
  constructor(option) {
    // 末尾にスラッシュ不要
    this.workDir = './workdir' || option.workDir;
    this.srcPath  = this.workDir + '/src'  || option.srcPath;
    this.tmpPath  = this.workDir + '/tmp'  || option.tmpPath;
    this.destPath = this.workDir + '/dest' || option.destPath;
    this.tmpImageFormat = 'jpg' || option.tmpImageFormat;

    this.compareResultPath = this.tmpPath + '/compare_result';
    this.splitResultPath = this.tmpPath + '/split_result';
    this.splitCounter = '%03d';
    this.splitDensity = 150;
    this.compareStyle = 'xor' || option.compareStyle;
    this.resultFilePrefix = 'result_' || option.resultFilePrefix;
    this.busy = false;
  }

  makedir(dirList) {
    dirList.forEach((item) => {
      this.execCmd([`mkdir -p ${item}`]);
    });
  }
  
  runTask(target1, target2, outputDiffOnly = true) {
    // ディレクトリを準備する
    this.makedir([
      this.srcPath,
      this.compareResultPath,
      this.splitResultPath + '/1',
      this.splitResultPath + '/2',
      this.destPath
    ]);
    
    // 画像を分割
    this.clean(this.splitResultPath);
    this.splitPdf(target1, 1);
    this.splitPdf(target2, 2);
    
    // 分割後のファイル一覧を取得する
    let t1Pages = this.readDir(`${this.splitResultPath}/1/`);
    let t2Pages = this.readDir(`${this.splitResultPath}/2/`);


    if (t1Pages.length <= 0 || t2Pages.length <= 0) {
      throw new Error('No pages!');
    }

    if (t1Pages.length !== t2Pages.length) {
      console.info('Different page number!')
    }

    // 比較を実行
    this.clean(this.compareResultPath);
    let result = [];
    t1Pages.forEach((fileName, index) => {
      let path1 = `${this.splitResultPath}/1/${fileName}`;
      if (typeof t2Pages[index] === 'undefined') {
        console.info('No target2 page. Stop this process.');
        return false;
      }
      let path2 = `${this.splitResultPath}/2/${t2Pages[index]}`;
      result.push(this.compareImage(path1, path2, outputDiffOnly));
    });

    // 比較結果をまとめる
    if (result[0] === false) {
      throw new Error('No success comparing!');
    }
    this.combineToPdf(this.compareResultPath);
  }

  /**
   * ディレクトリの中身を消去
   * 
   * @method clean
   * @param dir {String}
   * @return {Array}
   */
  clean(dir) {
    return del.sync(dir + '/**');
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
        result.stdout.push(Shell.exec(cmd));
        console.log(Shell.exec(cmd));
      } catch (e) {
        result.stdout.push(e);
        result.hasError = true;
        console.error(e);
      }
    });

    this.endBusy();
    return result;
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
   * @return {Object}
   */
  splitPdf(targetFileName, num) {
    return this.execCmd([GMagickTask.genCmdStr('splitPdf', {
      src: `${this.srcPath}/${targetFileName}`,
      dest: `${this.splitResultPath}/${num}/${this.splitCounter}.${this.tmpImageFormat}`,
      density: this.splitDensity
    })]);
  }

  /**
   * 比較結果画像をPDFに結合するコマンドを実行
   *
   * @method combinePdf
   * @return {Object}
   */
  combineToPdf(dest) {
    let cmd = GMagickTask.genCmdStr('combinePdf', {
      src: this.compareResultPath,
      dest: `${dest}/${this.resultFilePrefix}_${AppCommander.genDateStr()}.pdf`
    });
    return this.execCmd([cmd]);
  }

  /**
   * 画像を比較するコマンドを実行
   *
   *
   */
  compareImage(target1, target2, diffOnly) {
    let type = this.compareStyle;
    let destPath = this.destPath;

    // 差分があるファイルのみ画像を出力する
    if (diffOnly) {
      if (this.compareImageMetric(target1, target2)) {
        this.compareImageWithOutput(target1, target2, type, destPath);
        return true;
      }
      return false;
    }
    if (!diffOnly) {
      this.compareImageWithOutput(target1, target2, type, destPath);
      return true;
    }
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
    return GMagickTask.checkCompareResult(this.execCmd([cmd]).stdout[0]);
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
    return this.execCmd([cmd]);
  }
}