import bus from './renderer/bus'
import store from './renderer/store'
import router from './renderer/router'
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
        label: 'Import notes',
        accelerator: 'F4',
        click () {
          bus.$emit('openImport')
        }
      },
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
      {
        label: 'Documentation',
        submenu: [
          {
            label: 'Russian',
            click () {
              ipcRenderer.send('show-help-window')
            }
          }
        ]
      },
      {
        label: 'Quit',
        accelerator: 'CmdOrCtrl+Shift+Q',
        click () {
          ipcRenderer.send('system-exit')
        }
      }
    ]
  },
  {type: 'separator'},
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
    label: 'Edit note',
    click () {
      store.dispatch('openEditNotePage', store.state.Store.contextNoteId)
      router.replace('/editor')
    }
  },
  {
    label: 'Clone note',
    click () {
      store.dispatch('cloneNote', store.state.Store.contextNoteId)
    }
  },
  {
    label: 'Delete note',
    click () {
      if (confirm('Are you sure you want to delete this note?')) {
        if (store.state.Store.contextNoteIsDeleted) {
          store.dispatch('actionDeleteNote', store.state.Store.contextNoteId)
        } else {
          store.dispatch('actionMarkNoteAsDeleted', store.state.Store.contextNoteId)
        }
      }
    }
  },
  {type: 'separator'},
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

ipcRenderer.on('open-import', () => {
  bus.$emit('openImport')
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

ipcRenderer.on('open-help', () => {
  ipcRenderer.send('show-help-window')
})

ipcRenderer.on('track-usage', () => {
  bus.$emit('trackUsage')
})

ipcRenderer.on('fix-window-on-top', () => {
  store.dispatch('fixWindowOnTop')
})

export default {
  noteContextMenu
}
