// import del from 'del';
import fs from 'fs';
import del from 'del';
import GMagickTask from './GMagickTask';
import Shell from './Shell';

export default class AppCommander {
  constructor(option) {
    // 末尾にスラッシュ不要
    this.workDir =  option.workDir ? option.workDir : './workdir';
    this.tmpPath  = option.tmpPath ? option.tmpPath : this.workDir + '/tmp' ;
    this.destPath = option.destPath ? option.destPath : this.workDir + '/dest';
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
    this.splitPdf(target1, 1);
    this.splitPdf(target2, 2);
    // 比較結果をまとめる
    if (this.compareStep(this.splitResultPath, outputDiffOnly)[0] === false) {
      throw new Error('差分を生成できませんでした。完全に同一の内容でaる可能性があります。');
    }
    this.combineToPdf(destPath);
    this.clean(this.splitResultPath);
    this.clean(this.compareResultPath);
  }
  
  makedir(dirList) {
    dirList.forEach((item) => {
      this.execCmd([`mkdir -p ${item}`]);
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

  // 比較ステップ
  compareStep(splitResultPath, outputDiffOnly) {
    let t1Pages = this.readDir(`${splitResultPath}/1/`);
    let t2Pages = this.readDir(`${splitResultPath}/2/`);
    if (t1Pages.length <= 0 || t2Pages.length <= 0) {
      throw new Error('No pages!');
    }

    let result = [];
    t1Pages.forEach((fileName, index) => {
      let path1 = `${splitResultPath}/1/${fileName}`;
      if (typeof t2Pages[index] === 'undefined') {
        console.info('No target2 page. Stop this process.');
        return false;
      }
      let path2 = `${splitResultPath}/2/${t2Pages[index]}`;
      result.push(this.compareImage(path1, path2, fileName, outputDiffOnly));
    });
    return result;
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
        result.stdout.push(Shell.exec(cmd));
        console.log(Shell.exec(cmd));
      } catch (e) {
        result.stdout.push(e);
        result.hasError = true;
        console.error(e.cmd);
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
  splitPdf(targetFilePath, num) {
    return this.execCmd([GMagickTask.genCmdStr('splitPdf', {
      src: targetFilePath,
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
    let cmd = GMagickTask.genCmdStr('combineImages', {
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
  compareImage(target1, target2, fileName, diffOnly) {
    let type = this.compareStyle;
    let destPath = this.compareResultPath + '/' + fileName;

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