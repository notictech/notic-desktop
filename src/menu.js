import bus from './renderer/bus'
const {Menu} = require('electron').remote
const {ipcRenderer} = require('electron')

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
      {type: 'separator'},
      {
        label: 'Quit',
        accelerator: 'CmdOrCtrl+Shift+Q',
        click () {
          ipcRenderer.send('system-exit')
        }
      }
    ]
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

export default {
  noteContextMenu
}
