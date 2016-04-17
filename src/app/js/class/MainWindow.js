import $ from 'jquery';
import FileList from './FileList';

export default class MainWindow {
  constructor(app, BrowserWindow, dialog, ipcRenderer) {
    this.app = app;
    this.dialog = dialog;
    this.ipcRenderer = ipcRenderer;
    this.BrowserWindow = BrowserWindow;

    this.list1 = new FileList('#js-file-list-1', app, dialog, BrowserWindow);
    this.list2 = new FileList('#js-file-list-2', app, dialog, BrowserWindow);
    this.$runBtn = $('#js-run-task');
    this.$progress = $('#js-progress');
    this.unvisibleClass = 'is-unvisible';
    this.watchMessage(dialog, BrowserWindow, ipcRenderer);
    this.runBtnClickHandler();
  }

  startBusy() {
    this.$runBtn.prop('disabled', true);
    this.$progress.removeClass(this.unvisibleClass);
  }

  stopBusy() {
    this.$runBtn.prop('disabled', false);
    this.$progress.addClass(this.unvisibleClass);
  }

  watchMessage(dialog, BrowserWindow, ipcRenderer) {
    ipcRenderer.on('asynchronous-message', (event, type, message) => {
      if (type === 'error') {
        this.showErrorDialog(message, dialog, BrowserWindow);
      }
      this.stopBusy();
    });
  }

  showErrorDialog(message, dialog, bw) {
    return dialog.showMessageBox(bw.getFocusedWindow(), {
      title: 'エラー',
      type: 'info',
      message: 'エラーが発生しました。',
      detail: message,
      buttons: ['OK']
    });
  }

  runBtnClickHandler() {
    this.$runBtn.click(() => {
      this.runBtnOnClick()
    });
  }

  runBtnOnClick() {
    try {
      this.startBusy();
      let targets = this.makeRunTargets([this.list1, this.list2]);
      this.ipcRenderer.send('asynchronous-runTask', targets[0], targets[1], this.getDiffOnlyOption(), this.getDestDir());
    } catch (e) {
      this.showErrorDialog(e.message, this.dialog, this.BrowserWindow);
      this.stopBusy();
    }
  }

  makeRunTargets(lists) {
    let result = [];
    lists.forEach((list) => {
      let activeItem = list.getCurrentItemsPath();
      if (activeItem === '') {
        throw new Error('2つのPDFファイルを選択してから実行してください');
      }
      result.push(activeItem);
    });
    return result;
  }

  getDiffOnlyOption() {
    return true;
  }

  getDestDir() {
    return this.app.getPath('userDesktop');
  }
}