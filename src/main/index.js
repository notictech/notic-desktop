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
let appIcon = null
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    title: 'Notic',
    width: 800,
    height: 600,
    useContentSize: true,
    icon: `${__static}/icons/notic-inactive.png`
  })

  mainWindow.loadURL(winURL)

  // mainWindow.on('close', (e) => {
  //   e.preventDefault()
  //   mainWindow.hide()
  // })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  appIcon = new Tray(`${__static}/icons/notic-inactive.png`)
  appIcon.setToolTip('Notic Desktop')

  const clickAddNote = () => {
    if (mainWindow.isMinimized() || !mainWindow.isVisible()) {
      mainWindow.webContents.send('window-must-be-hidden')
    }
    mainWindow.webContents.send('add-note')
    mainWindow.show()
  }
  const clickAddNoteFromClipboard = () => {
    if (mainWindow.isMinimized() || !mainWindow.isVisible()) {
      mainWindow.webContents.send('window-must-be-hidden')
    }
    mainWindow.webContents.send('add-note-from-clipboard')
    mainWindow.show()
  }
  const clickOpenRecentNote = () => {
    mainWindow.webContents.send('open-recent-note')
    mainWindow.show()
  }
  const clickOpenNotifications = () => {
    mainWindow.webContents.send('open-notifications')
    mainWindow.show()
  }
  const clickOpenSettings = () => {
    mainWindow.webContents.send('open-settings')
    mainWindow.show()
  }
  const clickOpenAbout = () => {
    mainWindow.webContents.send('open-about')
    mainWindow.show()
  }
  const clickOpenChangeMasterPassword = () => {
    mainWindow.webContents.send('open-change-master-password')
    mainWindow.show()
  }
  const appReload = () => {
    mainWindow.reload()
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Add note', type: 'normal', click: clickAddNote
    },
    {
      label: 'Add note from clipboard', type: 'normal', click: clickAddNoteFromClipboard
    },
    {type: 'separator'},
    {
      label: 'Open recent note', type: 'normal', click: clickOpenRecentNote
    },
    {
      label: 'Notifications', type: 'normal', click: clickOpenNotifications
    },
    {type: 'separator'},
    {
      label: 'Change master key', type: 'normal', click: clickOpenChangeMasterPassword
    },
    {
      label: 'Settings', type: 'normal', click: clickOpenSettings
    },
    {
      label: 'About', type: 'normal', click: clickOpenAbout
    },
    {type: 'separator'},
    {
      label: 'Logout', type: 'normal', click: appReload
    },
    {type: 'separator'},
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

const {ipcMain} = require('electron')

ipcMain.on('set-tray-icon-notif', (event, arg) => {
  appIcon.setImage(`${__static}/icons/notic-notif.png`)
  mainWindow.setIcon(`${__static}/icons/notic-notif.png`)
})

ipcMain.on('set-tray-icon-inactive', (event, arg) => {
  appIcon.setImage(`${__static}/icons/notic-inactive.png`)
  mainWindow.setIcon(`${__static}/icons/notic-inactive.png`)
})

ipcMain.on('set-tray-icon-normal', (event, arg) => {
  appIcon.setImage(`${__static}/icons/notic-logo.png`)
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

// import { autoUpdater } from 'electron-updater'
//
// autoUpdater.on('update-downloaded', () => {
//   autoUpdater.quitAndInstall()
// })
//
// app.on('ready', () => {
//   if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
// })
