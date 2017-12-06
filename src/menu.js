import bus from './renderer/bus'
const {Menu} = require('electron').remote
const {ipcRenderer} = require('electron')

const mainMenuTemplate = [
  {
    label: '&App',
    submenu: [
      {
        label: 'Add note',
        accelerator: 'CmdOrCtrl+Space',
        click () {
          bus.$emit('addNote')
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

export default {
  noteContextMenu
}
