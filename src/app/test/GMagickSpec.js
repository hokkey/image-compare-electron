import gm from '../js/class/GMagick';

describe('GMagick', function () {

  describe('GMagick.getCompare', function () {

    it('画像比較コマンド文字列を返す', function (done) {
      let result = gm.getCompare('target1.pdf', 'target2.pdf', false, './output/out.pdf');
      assert.deepEqual(result, 'gm compare -highlight-style xor -file ./output/out.pdf target1.pdf target2.pdf');
      done();
    });

    it('画像比較コマンド文字列を返す・メトリック', function (done) {
      let result = gm.getCompare('target1.pdf', 'target2.pdf', true, './output/out.pdf');
      assert.deepEqual(result, 'gm compare -highlight-style xor -metric MAE target1.pdf target2.pdf');
      done();
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

  describe('GMagick.getSplit()', function () {
    
    it('画像を分割する', function (done) {
      let result = gm.getSplit('./test/target.pdf', './out%03d.pdf');
      assert.deepEqual(result, 'gm convert -density 150x150 ./test/target.pdf +adjoin ./out%03d.pdf');
      done();
    });
    
  });
  
});