import gm from '../js/class/GMagick';

describe('GMagick', function () {

  describe('GMagick.getCompare', function () {

    it('画像比較コマンド文字列を返す', function (done) {
      let result = gm.getCompare('./output/out.pdf', 'target1.pdf', 'target2.pdf');
      assert.deepEqual(result, 'gm compare -highlight-style xor -file ./output/out.pdf target1.pdf target2.pdf');
      done();
    });

    describe('異常系テスト', function () {
      let tests = [
        ['out', 't1.pdf', 't2.pdf'],
        ['out.pdf', 't1', 't2.pdf'],
        ['out.pdf', 't1.pdf', 't2']
      ];

      tests.forEach((ary) => {
        it('引数に拡張子".pdf"が含まれない場合はエラー', function (done) {
          assert.throws(() => {
            gm.getCompare(...ary);
          });
          done();
        });
      });

    });
  });


  describe('GMagick.getCombine()', function () {

    it('画像を結合して1つのPDFにする', function (done) {
      let result = gm.getCombine('./test/', './out.pdf');
      assert.deepEqual(result, 'gm convert ./test/* ./out.pdf');
      done();
    });

    it('第一引数が"/"で終わらない場合も補完する', function (done) {
      let result = gm.getCombine('./test', './out.pdf');
      assert.deepEqual(result, 'gm convert ./test/* ./out.pdf');
      done();
    });

    it('第二引数に".pdf"が含まれない時はエラー', function (done) {
      assert.throws(function () {
        let result = gm.getCombine('./test', './outpdf');
      });
      done();
    });

  });

});