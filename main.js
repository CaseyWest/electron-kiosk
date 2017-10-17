'use strict'

const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow

const fs = require('fs')
const os = require('os')
const path = require('path')
const url = require('url')

let mainWindow

function loadConfig(callback) {
  let pathToConfig = path.join(os.homedir(), '.kiosk/config.json')
  if(!fs.existsSync(pathToConfig))
    pathToConfig = './example.config.json'

  console.log(pathToConfig)
  let config;
  fs.readFile(pathToConfig, 'utf-8', (err, data) => {
    if(err) { console.log('err'); return; }
    typeof callback === 'function' && callback(JSON.parse(data));
  });
}

function createWindow () {
  loadConfig((config) => {
    mainWindow = new BrowserWindow({
      width: 1024, 
      height: 768, 
      kiosk: config.kioskMode
    })

    mainWindow.loadURL(config.url)

    mainWindow.on('closed', function () {
      mainWindow = null
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
