'use strict'

import { app, BrowserWindow, dialog } from 'electron'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    useContentSize: true,
    title: 'Notic',
    icon: `${__static}/icons/notic-inactive.png`
  })

  mainWindow.loadURL(winURL)
  mainWindow.on('close', (e) => {
    let choice = dialog.showMessageBox(mainWindow, {
      type: 'question',
      buttons: ['Exit', 'Cancel'],
      title: 'Confirm exit',
      message: 'Do you really want to exit Notic?'
    })
    if (choice === 1) e.preventDefault()
  })
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.on('restore', () => {
    mainWindow.webContents.send('track-usage')
    mainWindow.webContents.send('fix-window-on-top')
  })

  mainWindow.on('show', () => {
    mainWindow.webContents.send('track-usage')
    mainWindow.webContents.send('fix-window-on-top')
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

const {ipcMain} = require('electron')

ipcMain.on('show-help-window', (event, arg) => {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    parent: mainWindow,
    useContentSize: true,
    title: 'Documentation'
  })
  win.setMenu(null)
  win.loadURL(`file://${__static}/notic_manual_ru.html`)
  win.on('closed', () => {
    win = null
  })
  win.show()
})

ipcMain.on('set-icon-notif', (event, arg) => {
  // appIcon.setImage(`${__static}/icons/notic-notif.png`)
  mainWindow.setIcon(`${__static}/icons/notic-notif.png`)
})

ipcMain.on('set-icon-inactive', (event, arg) => {
  // appIcon.setImage(`${__static}/icons/notic-inactive.png`)
  mainWindow.setIcon(`${__static}/icons/notic-inactive.png`)
})

ipcMain.on('set-icon-normal', (event, arg) => {
  // appIcon.setImage(`${__static}/icons/notic-logo.png`)
  mainWindow.setIcon(`${__static}/icons/notic-logo.png`)
})

ipcMain.on('logout', function (event, arg) {
  mainWindow.reload()
})

ipcMain.on('system-exit', function (event, arg) {
  app.exit(0)
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
