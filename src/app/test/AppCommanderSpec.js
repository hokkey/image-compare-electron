import AppCommander from '../js/class/AppCommander';

describe('AppCommander', function () {
  let ac;

  before(function () {
    ac = new AppCommander();
  });

  describe('execCmd', function () {

    it('コマンド実行結果をオブジェクトとして返す', function (done) {
      let expect = {
        hasError: false,
        stdout: ['try1\n', 'try2\n', 'try3\n']
      };

      let result = ac.execCmd([
        'echo try1',
        'echo try2',
        'echo try3'
      ]);

      assert.deepEqual(result, expect);
      done();
    });

    it('不正な終了がある場合はhasErrorがtrueになる', function (done) {
      let expect = {
        hasError: true,
        stdout: ['try1\n', 'try2\n', 'try3\n']
      };

      let result = ac.execCmd([
        'echo try1',
        'e try3',
        'echo try2'
      ]);

      assert.deepEqual(result.hasError, expect.hasError);
      done();
    });
  });

  describe('genDateStr', function () {

    it('入力したdateを文字列で返す。1ケタの時はケタ合わせのゼロを含む', function () {
      let expect = '2016_01_02_03_15_38_125';
      let date = new Date('2016-01-02T03:15:38.125+09:00');
      assert(AppCommander.genDateStr(date) === expect);
    });
  });

  describe('compareImageMetric', function () {
    let testPath = './src/app/test/image/';

    it('内容が同じ画像の場合はtrue', function () {
      assert(ac.compareImageMetric(`${testPath}1.jpg`, `${testPath}2.jpg`) === true);
    });

    it('内容が違う画像の場合はfalse', function () {
      assert(ac.compareImageMetric(`${testPath}1.jpg`, `${testPath}3.jpg`) === false);
    });
  });

  describe('compareImageWithOutput', function () {
    let testPath = './src/app/test/image/';

    it('期待される画像と全く同じ画像が生成される', function () {
      ac.compareImageWithOutput(`${testPath}1.jpg`, `${testPath}3.jpg`, 'xor', `${testPath}/result.jpg`);
      assert(ac.compareImageMetric(`${testPath}4.jpg`, `${testPath}result.jpg`) === true);
    });
  });

 describe('readDir', function () {
    let testPath = './src/app/test/image/';

    it('期待されるファイルの一覧が返される', function () {
      assert.deepEqual(ac.readDir(testPath), ['1.jpg', '2.jpg', '3.jpg', '4.jpg', 'result.jpg']);
    });
  });

});