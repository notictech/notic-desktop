import bus from './renderer/bus'
const {Menu} = require('electron').remote

const mainMenuTemplate = [
  {
    label: 'App',
    submenu: [
      {
        label: 'Add note',
        accelerator: 'CmdOrCtrl+Space',
        click () {
          console.log('@@@@')
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

export default {
  noteContextMenu
}
