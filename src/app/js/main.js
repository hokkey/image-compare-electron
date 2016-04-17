const electron = require('electron');
const app = electron.app;
let BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const childProcess = require('child_process');

import AppCommander from './class/AppCommander';
let ac;

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
let mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  if (process.platform !== 'darwin')
    app.quit();
});


// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 600, height: 450});

  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + __dirname + '/index.html');
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  ac = new AppCommander({workDir: app.getPath('temp')});

  ipcMain.on('asynchronous-runTask', function (event, arg1, arg2, outputDiffOnly, dest) {
    if (ac.busy) {
      event.sender.send('asynchronous-message', 'signal', false);
      return false;
    }
    try {
      ac.runTask(arg1, arg2, outputDiffOnly, dest);
      event.sender.send('asynchronous-message', 'signal', false);
    } catch(e) {
      console.error(e);
      event.sender.send('asynchronous-message', 'error', e.message);
    } 
  });
});