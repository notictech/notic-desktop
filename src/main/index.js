'use strict'

import { app, BrowserWindow, Tray, Menu } from 'electron'

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
    icon: `${__static}/icons/notic-logo.png`
  })

  mainWindow.loadURL(winURL)

  // mainWindow.on('close', (e) => {
  //   e.preventDefault()
  //   mainWindow.hide()
  // })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  let appIcon = new Tray(`${__static}/icons/notic-logo.png`)
  appIcon.setToolTip('notic-desktop')
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Exit', type: 'normal', click: () => { app.exit(0) }
    }
  ])
  appIcon.setContextMenu(contextMenu)
  appIcon.on('click', () => {
    if (mainWindow.isMinimized() || !mainWindow.isVisible()) {
      mainWindow.show()
    } else {
      mainWindow.hide()
    }
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

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

// import { autoUpdater } from 'electron-updater'
//
// autoUpdater.on('update-downloaded', () => {
//   autoUpdater.quitAndInstall()
// })
//
// app.on('ready', () => {
//   if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
// })
