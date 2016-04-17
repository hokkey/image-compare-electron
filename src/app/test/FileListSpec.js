import FileList from '../js/class/FileList';

describe('FileList', function () {
  
  let fl;
  
  before(function () {
    document.body.innerHTML = __html__['src/app/test/html/pdf-group.html'];

    let remote = require('remote');
    let app = remote.require('app');
    let BrowserWindow = remote.require('browser-window');
    let dialog = remote.require('dialog');
    fl = new FileList('#js-file-list-1', app, dialog, BrowserWindow);
  });
  
  it('画像比較コマンド文字列を返す', function (done) {
    fl.addItem('/test/item.pdf');
    done();
  });
  
});