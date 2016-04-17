import childProcess from 'child_process';

const DEFAULT_EXEC_OPTION = {
  // 環境変数
  env: {},
  // コマンドを実行するカレントディレクトリ
  cwd: '.'
};

export default class Shell {

  /**
   * コマンドを実行する
   *
   * @method exec
   * @static
   *
   */
  static exec(command) {
    return '' + childProcess.execSync(command);
  }
  
  static execFile(command) {
    command = command[0].substr(3);
    return new Promise((resolve, reject) => {
      childProcess.execFile(`${__dirname}/scripts/gm.sh`, command.split(' '), (error, stdout, stderr) => {
        console.log(stdout);
        resolve(stdout);
      });
    })
  }
}