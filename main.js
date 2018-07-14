import { app, globalShortcut, BrowserWindow } from 'electron'
import { existsSync, readFile } from 'fs'
import { homedir } from 'os'
import { join } from 'path'

const defaultConfig = './example.config.json'
let mainWindow

function loadConfig (callback) {
  let pathToConfig = join(homedir(), '.kiosk/config.json')
  if (!existsSync(pathToConfig)) { pathToConfig = defaultConfig }

  readFile(pathToConfig, 'utf-8', (err, data) => {
    if (err) { console.log('err'); return }
    typeof callback === 'function' && callback(JSON.parse(data))
  })
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
