const remote = require('remote');
const app = require('electron').remote.app;
const BrowserWindow = require('electron').remote.BrowserWindow;
const dialog = require('electron').remote.dialog;
const ipcRenderer = require('electron').ipcRenderer;

import MainWindow from './class/MainWindow';
new MainWindow(app, BrowserWindow, dialog, ipcRenderer);