const remote = require('remote');
const app = require('electron').remote.app;
const BrowserWindow = require('electron').remote.BrowserWindow;
const dialog = require('electron').remote.dialog;
const ipcRenderer = require('electron').ipcRenderer;

import $ from 'jquery';
import FileList from './class/FileList';

class MainWindow {
  constructor(app, BrowserWindow, dialog, ipcRenderer) {
    this.app = app;
    this.dialog = dialog;
    this.ipcRenderer = ipcRenderer;

    this.list1 = new FileList('#js-file-list-1', app, dialog, BrowserWindow);
    this.list2 = new FileList('#js-file-list-2', app, dialog, BrowserWindow);
    this.watchMessage(dialog, BrowserWindow);
    this.runBtnClickHandler();
  }

  watchMessage(dialog, BrowserWindow) {
    ipcRenderer.on('message', (event, type, message) => {
      if (type === 'error') {
        this.showErrorDialog(message);
      }
    });
  }

  showErrorDialog(message) {
    let win = BrowserWindow.getFocusedWindow();
    return this.dialog.showMessageBox(win, {
      title: 'エラー',
      type: 'info',
      message: 'エラーが発生しました。',
      detail: message,
      buttons: ['OK']
    });
  }

  runBtnClickHandler() {
    $('#js-run-task').click(() => {
      this.runBtnOnClick()
    });
  }

  runBtnOnClick() {
    try {
      let targets = this.makeRunTargets([this.list1, this.list2]);
      this.ipcRenderer.send('runTask', targets[0], targets[1], this.getDiffOnlyOption(), this.getDestDir());
    } catch(e) {
      this.showErrorDialog(e.message);
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
    return app.getPath('userDesktop');
  }
}

new MainWindow(app, BrowserWindow, dialog, ipcRenderer);