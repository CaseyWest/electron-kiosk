'use strict'

const { app, globalShortcut, BrowserWindow } = require('electron')
const fs = require('fs')
const os = require('os')
const path = require('path')
const url = require('url')

let mainWindow

function loadConfig(callback) {
  let pathToConfig = path.join(os.homedir(), '.kiosk/config.json')
  if(!fs.existsSync(pathToConfig))
    pathToConfig = './example.config.json'

  let config;
  fs.readFile(pathToConfig, 'utf-8', (err, data) => {
    if(err) { console.log('err'); return; }
    typeof callback === 'function' && callback(JSON.parse(data));
  });
}

function createWindow () {
  loadConfig((config) => {
    mainWindow = new BrowserWindow({
      width: config.window.width, 
      height: config.window.height,
      closable: config.window.isClosable,
      kiosk: config.useKioskMode,
      showInTaskbar: config.showInTaskbar,
      alwaysOnTop: true,
      show: false,
      focusable: true
    })

    mainWindow.setMaximizable(config.window.isMaximizable)
    mainWindow.setMinimizable(config.window.isMinimizable)
    mainWindow.setFullScreenable(config.window.isMaximizable)
    mainWindow.setResizable(config.window.isResizable)

    mainWindow.loadURL(config.urlToLoad)

    mainWindow.on('closed', function () {
      mainWindow = null
    })

    globalShortcut.register(config.shortcuts.kill, () => {
      app.exit()
    })

    globalShortcut.register(config.shortcuts.restart, () => {
      app.relaunch()
      app.exit()
    })

    mainWindow.once('ready-to-show', () => {
      mainWindow.show()
    })
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})
