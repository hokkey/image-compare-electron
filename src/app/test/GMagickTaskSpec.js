import GMagickTask from '../js/class/GMagickTask';

describe('GMagickTask', function () {

  it('splitPdfTask', function (done) {
    let expect = 'gm convert -density 150x150 test.pdf +adjoin hoge%03d.jpg';
    let option = {
      src: 'test.pdf',
      dest: 'hoge%03d.jpg'
    };
    assert(GMagickTask.splitPdfTask(option), expect);
    done();
  });

  it('combineImagesTask', function (done) {
    let expect = 'gm convert test/* dest/result.pdf';
    let option = {
      src: 'test/',
      dest: 'dest/result.pdf'
    };
    assert.strictEqual(GMagickTask.combineImagesTask(option), expect);
    done();
  });

  it('compareImagesTask', function (done) {
    let expect = 'gm compare -highlight-style xor -metric MAE tmp/1/1.jpg tmp/2/1.jpg';
    let option = {
      src: 'tmp/1/1.jpg',
      src2: 'tmp/2/1.jpg',
      dest: 'tmp/result/1.jpg',
      metricOnly: true,
      compareStyle: 'xor'
    };
    assert.strictEqual(GMagickTask.compareImagesTask(option), expect);
    done();
  });
  
});