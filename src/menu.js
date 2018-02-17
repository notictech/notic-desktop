import bus from './renderer/bus'
const {Menu} = require('electron').remote
const {ipcRenderer} = require('electron')
const {clipboard} = require('electron')

const mainMenuTemplate = [
  {
    label: '&Menu',
    submenu: [
      {
        label: 'Add note',
        accelerator: 'CmdOrCtrl+Space',
        click () {
          bus.$emit('addNote')
        }
      },
      {
        label: 'Add note from clipboard',
        accelerator: 'CmdOrCtrl+Shift+Space',
        click () {
          bus.$emit('addNoteFromClipboard')
        }
      },
      {type: 'separator'},
      {
        label: 'Open recent note',
        accelerator: 'CmdOrCtrl+E',
        click () {
          bus.$emit('openRecentNote')
        }
      },
      {
        label: 'Notifications',
        accelerator: 'CmdOrCtrl+N',
        click () {
          bus.$emit('openNotifications')
        }
      },
      {type: 'separator'},
      {
        label: 'Change master password',
        accelerator: 'F3',
        click () {
          bus.$emit('openChangeMasterPassword')
        }
      },
      {
        label: 'Settings',
        accelerator: 'F2',
        click () {
          bus.$emit('openSettings')
        }
      },
      {
        label: 'About',
        accelerator: 'F1',
        click () {
          bus.$emit('openAbout')
        }
      },
      {type: 'separator'},
      {
        label: 'Quit',
        accelerator: 'CmdOrCtrl+Shift+Q',
        click () {
          ipcRenderer.send('system-exit')
        }
      }
    ]
  },
  {
    label: 'Logout (Ctrl+R)',
    accelerator: 'CmdOrCtrl+R',
    click () {
      clipboard.writeText('')
      ipcRenderer.send('logout')
    }
  }
]
const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)
Menu.setApplicationMenu(mainMenu)

const noteContextMenu = Menu.buildFromTemplate([
  {
    label: 'Copy selected',
    accelerator: 'CmdOrCtrl+C',
    click () {
      bus.$emit('copyText')
    }
  }
])

ipcRenderer.on('add-note', () => {
  bus.$emit('addNote')
})

ipcRenderer.on('add-note-from-clipboard', () => {
  bus.$emit('addNoteFromClipboard')
})

ipcRenderer.on('window-must-be-hidden', () => {
  bus.$emit('windowMustBeHidden')
})

ipcRenderer.on('open-recent-note', () => {
  bus.$emit('openRecentNote')
})

ipcRenderer.on('open-notifications', () => {
  bus.$emit('openNotifications')
})

ipcRenderer.on('open-change-master-password', () => {
  bus.$emit('openChangeMasterPassword')
})

ipcRenderer.on('open-settings', () => {
  bus.$emit('openSettings')
})

ipcRenderer.on('open-about', () => {
  bus.$emit('openAbout')
})

ipcRenderer.on('track-usage', () => {
  bus.$emit('trackUsage')
})

export default {
  noteContextMenu
}
