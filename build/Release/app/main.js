'use strict';

var _electron = require('electron');

var _fs = require('fs');

var _os = require('os');

var _path = require('path');

var defaultConfig = './example.config.json';
var mainWindow = void 0;

function loadConfig(callback) {
  var pathToConfig = (0, _path.join)((0, _os.homedir)(), '.kiosk/config.json');
  if (!(0, _fs.existsSync)(pathToConfig)) {
    pathToConfig = defaultConfig;
  }

  (0, _fs.readFile)(pathToConfig, 'utf-8', function (err, data) {
    if (err) {
      console.log('err');return;
    }
    typeof callback === 'function' && callback(JSON.parse(data));
  });
}

function createWindow() {
  loadConfig(function (config) {
    mainWindow = new _electron.BrowserWindow({
      width: config.window.width,
      height: config.window.height,
      closable: config.window.isClosable,
      kiosk: config.useKioskMode,
      showInTaskbar: config.showInTaskbar,
      alwaysOnTop: true,
      show: false,
      focusable: true
    });

    mainWindow.setMaximizable(config.window.isMaximizable);
    mainWindow.setMinimizable(config.window.isMinimizable);
    mainWindow.setFullScreenable(config.window.isMaximizable);
    mainWindow.setResizable(config.window.isResizable);

    mainWindow.loadURL(config.urlToLoad);

    mainWindow.on('closed', function () {
      mainWindow = null;
    });

    _electron.globalShortcut.register(config.shortcuts.kill, function () {
      _electron.app.exit();
    });

    _electron.globalShortcut.register(config.shortcuts.restart, function () {
      _electron.app.relaunch();
      _electron.app.exit();
    });

    mainWindow.once('ready-to-show', function () {
      mainWindow.show();
    });
  });
}

_electron.app.on('ready', createWindow);

_electron.app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    _electron.app.quit();
  }
});

_electron.app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});