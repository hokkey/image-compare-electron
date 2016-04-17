import $ from 'jquery';

export default class FileList {
  constructor(containerName, app, dialog, browserWindow) {
    this.app = app;
    this.dialog = dialog;
    this.browserWindow = browserWindow;

    this.$container = $(containerName);
    this.$addBtn = this.$container.find('.js-add-btn');
    this.$removeBtn = this.$container.find('.js-remove-btn');
    this.activeItem = null;
    this.$list = this.$container.find('.js-list');
    this.items = [];
    this.viewIdPrefix = 'js-file-item-';
    this.viewGeneralName = 'js-file-item';
    this.activeClass = 'active';
    this.dialogOption = {
      title: 'PDFファイルを選択',
      detail: 'PDFファイルを選択',
      // defaultPath: app.getPath('userDesktop'),
      filters: [{name: 'PDF', extensions: ['pdf']}],
      properties: ['openFile', 'multiSelections']
    };

    this.addBtnClickHandler();
    this.removeBtnClickHandler();
  }

  getCurrentItemsPath() {
    if (this.items.length === 0 || this.activeItem === null) {
      return '';
    }
    return this.items[this.activeItem].path;
  }

  addBtnClickHandler() {
    this.$addBtn.click((e) => {
      let win = this.browserWindow.getFocusedWindow();
      this.dialog.showOpenDialog(win, this.dialogOption, (filePathList) => {
        if (typeof filePathList === 'undefined') {
          console.info('no files were selected.');
          return false;
        }
        filePathList.forEach((filePath) => {
          this.addItem(filePath);
        });
        this.setActiveItem(this.items.length - 1);
        return true;
      });
    });
  }

  removeBtnClickHandler() {
    this.$removeBtn.click(() => {
      this.removeAllItems();
    });
  }

  removeAllItems() {
    if (this.items.length === 0) {
      return false;
    }
    this.$list.empty();
    this.items = [];
    this.activeItem = null;

    return true;
  }

  viewItemClickHandler($view) {
    $view.click((e) => {
      let $t = $(e.target).closest('a');
      let index = parseInt($t.data('index'), 10);
      this.setActiveItem(index);
    });
  }

  setActiveItem(index) {
    if (this.activeItem === index) {
      return false;
    }
    this.activeItem = index;
    this.$list.find(`.${this.viewGeneralName}`).removeClass(this.activeClass);
    return this.$list.find(`#${this.viewIdPrefix}${index}`).addClass(this.activeClass);
  }

  addItem(filePath) {
    let fileName = filePath.match(/[^/]*$/)[0];
    let index = this.items.push({path: filePath, fileName: fileName});
    let $view = $(this.createItemView(index - 1, fileName, filePath));
    this.viewItemClickHandler($view);
    return $view.appendTo(this.$list);
  }

  removeItem(index) {
    this.items[index] = {};
    return this.$list.find(`#${this.viewIdPrefix}${index}`).remove();
  }

  createItemView(index, fileName, filePath) {
    return `<a href="#" class="list-group-item pdf-item ${this.viewGeneralName}" id="${this.viewIdPrefix}${index}" data-index="${index}">
              <h1 class="h4 pdf-item__head">${fileName}</h1>
              <small class="small pdf-item__path">${filePath}</small>
            </a>`;
  }
  
}