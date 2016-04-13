import GMagickTask from '../js/class/GMagickTask';

describe('GMagickTask', function () {

  it('splitPdfTask', function (done) {

    let option = [
      {
        src: 'test.pdf',
        dest: 'hoge%03d.jpg'
      }
    ];
    
    console.log(new GMagickTask('splitPdf', option));
    done();
  });
  
});