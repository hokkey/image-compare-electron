import Shell from '../js/class/Shell';

describe('Shell', function () {

  it('exec', function (done) {
    assert(Shell.exec('echo "this_is_test"') === 'this_is_test\n');
    done();
  });

});