import bus from '../../bus'

const {Menu} = require('electron').remote
const remote = require('electron').remote
const Datastore = require('nedb')
const moment = require('moment')
const Mark = require('mark.js')
const {clipboard} = require('electron')

let db

const noteContextMenu = Menu.buildFromTemplate([
  {
    label: 'Copy',
    accelerator: 'CmdOrCtrl+C',
    click () {
      bus.$emit('copyText')
    }
  }
])

const blankNote = {
  doctype: 'note',
  title: '',
  content: '',
  createdAt: '',
  updatedAt: '',
  deleted: false,
  secrets: [],
  secretsHaveErrors: null,
  reminder: false,
  reminderDate: null,
  reminderTime: null,
  reminderRepeat: 0
}

const state = {
  page: '/',
  searchFilter: 'notes',
  activeNoteIndex: null,
  activeNoteId: null,
  editorMode: 'add',
  settings: {
    dbPath: 'default.ntc',
    localKeymap: 'ru',
    historyMaxLength: 100
  },
  notes: [],
  note: {},
  searchQuery: '',
  history: []
}

const mutations = {
  setActiveNoteIndex: (state, data) => { state.activeNoteIndex = data },
  setActiveNoteId: (state, data) => { state.activeNoteId = data },
  setEditorMode: (state, data) => { state.editorMode = data },
  updateNotes: (state, data) => { state.notes = data },
  updateNote: (state, data) => {
    state.note = data
  },
  updateNoteTitle: (state, text) => { state.note.title = text },
  updateNoteContent: (state, text) => { state.note.content = text },
  setNoteCreatedAt: (state, text) => { state.note.createdAt = text },
  setNoteUpdatedAt: (state, text) => { state.note.updatedAt = text },
  addSecretToNote: (state) => {
    let secret = genPassword()
    state.note.secrets.push({
      title: 'password',
      content: secret,
      contentRepeat: secret,
      visibility: false,
      errorNotEquals: null,
      errorTitleEmpty: null
    })
  },
  deleteSecretFromNote: (state, index) => { state.note.secrets.splice(index, 1) },
  secretsCheckErrors (state) {
    state.note.secretsHaveErrors = null
    for (let i = 0; i < state.note.secrets.length; i++) {
      state.note.secrets[i].errorNotEquals = null
      state.note.secrets[i].errorTitleEmpty = null
      if (!state.note.secrets[i].title.length) {
        state.note.secretsHaveErrors = false
        state.note.secrets[i].errorTitleEmpty = false
      }
      if (state.note.secrets[i].content !== state.note.secrets[i].contentRepeat) {
        state.note.secretsHaveErrors = false
        state.note.secrets[i].errorNotEquals = false
      }
    }
  },
  updateSecretTitle (state, obj) {
    state.note.secrets[obj.index].title = obj.data
  },
  updateSecretContent (state, obj) {
    state.note.secrets[obj.index].content = obj.data
  },
  updateSecretContentRepeat (state, obj) {
    state.note.secrets[obj.index].contentRepeat = obj.data
  },
  toggleSecretVisibility (state, index) { state.note.secrets[index].visibility = !state.note.secrets[index].visibility },
  genSecret (state, index) {
    let secret = genPassword()
    state.note.secrets[index].content = secret
    state.note.secrets[index].contentRepeat = secret
  },
  cleanNote (state) {
    delete state.note.secretsHaveErrors
    for (let i = 0; i < state.note.secrets.length; i++) {
      delete state.note.secrets[i].contentRepeat
      delete state.note.secrets[i].errorNotEquals
      delete state.note.secrets[i].errorTitleEmpty
      delete state.note.secrets[i].visibility
    }
  },
  setSearchQuery: (state, data) => { state.searchQuery = data },
  setSearchFilter (state, filter) {
    state.searchFilter = filter
  },
  toggleNoteReminder (state) {
    state.note.reminder = !state.note.reminder
  },
  changeNoteReminderDate (state, event) {
    state.note.reminderDate = moment(event).valueOf()
  },
  changeNoteReminderTime (state, event) {
    state.note.reminderTime = event
  },
  changeNoteReminderRepeat (state, event) {
    state.note.reminderRepeat = event
  },
  setHistory: (state, data) => { state.history = data },
  addNoteToHistory: (state, id) => {
    if (state.history.length === state.settings.historyMaxLength - 1) {
      state.history.shift()
    }
    state.history.push({
      s: state.searchQuery,
      n: id
    })
  }

}

const getters = {
  notes: state => {
    return state.notes
  },
  searchFilter: state => {
    return state.searchFilter
  }
}

const actions = {
  initDb (context, callback) {
    db = new Datastore({ filename: context.state.settings.dbPath, autoload: true })
    db.count({}, (err, count) => {
      if (err) {
        console.log(err)
        return
      }
      if (!count) {
        let now = moment()
        let note = copyObject(blankNote)
        note.title = 'Hello, Notic!'
        note.content = `Welcome! I'm your first note.\nYou can edit or delete me.`
        note.createdAt = now.valueOf()
        note.updatedAt = now.valueOf()
        note.secrets = [
          {title: 'password', content: 'nE3LbJwKEm06xY98cp12y32508Du699f'},
          {title: 'another password', content: 'R46zq8xc0eTt90qGkQ1hKl1b7Jym621Y'}
        ]
        note.reminderDate = now.add(1, 'day').valueOf()
        note.reminderTime = '09:00'
        db.insert(note)
        db.insert({doctype: 'history', data: state.history})
      } else {
        callback()
      }
      callback()
    })
  },
  searchNotes (context, query) {
    this.commit('setSearchQuery', query)
    let queryWords = query.trim().split(' ')
    let and = []
    for (let i = 0; i < queryWords.length; i++) {
      let or = []
      or.push({title: new RegExp(RegExp.quote(queryWords[i]), 'i')})
      or.push({title: new RegExp(remapString(RegExp.quote(queryWords[i]), 'en', state.settings.localKeymap), 'i')})
      or.push({title: new RegExp(remapString(RegExp.quote(queryWords[i]), state.settings.localKeymap, 'en'), 'i')})
      or.push({content: new RegExp(RegExp.quote(queryWords[i]), 'i')})
      or.push({content: new RegExp(remapString(RegExp.quote(queryWords[i]), 'en', state.settings.localKeymap), 'i')})
      or.push({content: new RegExp(remapString(RegExp.quote(queryWords[i]), state.settings.localKeymap, 'en'), 'i')})
      and.push({$or: or})
    }

    if (state.searchFilter === 'notes') {
      and.push({deleted: false})
    } else if (state.searchFilter === 'deleted') {
      and.push({deleted: true})
    } else if (state.searchFilter === 'reminder') {
      and.push({reminder: true})
    }

    and.push({doctype: 'note'})

    let cond = {$and: and}

    db.find(cond).sort({createdAt: -1}).exec((err, docs) => {
      if (err) {
        console.log(err)
      }
      this.commit('updateNotes', docs)
      highlightNotes()
      if (docs.length) {
        this.commit('setActiveNoteIndex', 0)
        this.commit('setActiveNoteId', docs[0]._id)
      }
    })
  },
  actionDeleteNote (context, id) {
    db.remove({ _id: id }, {}, () => {
      this.dispatch('searchNotes', state.searchQuery)
    })
  },
  actionMarkNoteAsDeleted (context, id) {
    db.update({ _id: id }, { $set: { deleted: true } }, () => {
      this.dispatch('searchNotes', state.searchQuery)
    })
  },
  openAddNotePage (context) {
    let note = copyObject(blankNote)
    let now = moment()
    note.reminderDate = now.add(1, 'day').valueOf()
    note.reminderTime = '09:00'
    this.commit('updateNote', note)
    this.commit('setEditorMode', 'add')
  },
  openEditNotePage (context, id) {
    db.findOne({_id: id}, (err, doc) => {
      if (err) console.log(err)

      for (let i = 0; i < doc.secrets.length; i++) {
        doc.secrets[i].contentRepeat = doc.secrets[i].content
        doc.secrets[i].visibility = false
        doc.secrets[i].errorNotEquals = null
        doc.secrets[i].errorTitleEmpty = null
      }

      this.commit('updateNote', doc)
      this.commit('setEditorMode', 'edit')
    })
  },
  editorChangeTitle (context, text) {
    this.commit('updateNoteTitle', text)
  },
  editorChangeContent (context, text) {
    this.commit('updateNoteContent', text)
  },
  editorSaveAndClose (context, successCallback) {
    if (!state.note.content.length) {
      alert('Content must be not empty.')
      return
    }
    if (state.note.secretsHaveErrors === false) {
      alert('Invalid secrets data.')
      return
    }

    this.commit('cleanNote')

    if (!state.note.title.length) {
      this.commit('updateNoteTitle', '#untitled ' + state.note.content.substr(0, 30) + '...')
    }
    let now = moment()
    if (state.editorMode === 'add') {
      this.commit('setNoteCreatedAt', now.valueOf())
      this.commit('setNoteUpdatedAt', now.valueOf())
      db.insert(state.note, (err) => {
        if (err) console.log(err)
        this.commit('updateNote', copyObject(blankNote))
        this.dispatch('searchNotes', state.searchQuery)
        successCallback()
      })
    } else {
      this.commit('setNoteUpdatedAt', now.valueOf())
      db.update({ _id: state.note._id }, state.note, {}, () => {
        this.commit('updateNote', copyObject(blankNote))
        this.dispatch('searchNotes', state.searchQuery)
        successCallback()
      })
    }
  },
  editorAddSecret (context) {
    this.commit('addSecretToNote')
  },
  editorDeleteSecret (context, index) {
    this.commit('deleteSecretFromNote', index)
  },
  editorUpdateSecretTitle (context, obj) {
    this.commit('updateSecretTitle', obj)
    this.commit('secretsCheckErrors')
  },
  editorUpdateSecretContent (context, obj) {
    this.commit('updateSecretContent', obj)
    this.commit('secretsCheckErrors')
  },
  editorUpdateSecretContentRepeat (context, obj) {
    this.commit('updateSecretContentRepeat', obj)
    this.commit('secretsCheckErrors')
  },
  toggleSecretVisibility (context, index) {
    this.commit('toggleSecretVisibility', index)
  },
  genSecret (context, index) {
    this.commit('genSecret', index)
  },
  setSearchFilter (context, filter) {
    this.commit('setSearchFilter', filter)
    this.dispatch('searchNotes', state.searchQuery)
  },
  restoreAllDeletedNotes (context) {
    db.update({doctype: 'note', deleted: true}, {$set: {deleted: false}}, {multi: true}, () => {
      this.commit('setSearchFilter', 'notes')
      this.dispatch('searchNotes', state.searchQuery)
    })
  },
  emptyTrash (context) {
    db.remove({doctype: 'note', deleted: true}, {multi: true}, () => {
      this.commit('setSearchFilter', 'notes')
      this.dispatch('searchNotes', state.searchQuery)
    })
  },
  restoreDeletedNote (context, id) {
    db.update({ _id: id }, {$set: {deleted: false}}, () => {
      this.dispatch('searchNotes', state.searchQuery)
    })
  },
  editorToggleReminder (context) {
    this.commit('toggleNoteReminder')
  },
  editorChangeReminderDate (context, event) {
    this.commit('changeNoteReminderDate', event)
  },
  editorChangeReminderTime (context, event) {
    this.commit('changeNoteReminderTime', event)
  },
  editorChangeReminderRepeat (context, event) {
    this.commit('changeNoteReminderRepeat', event)
  },
  setActiveNoteIndex (context, index) {
    this.commit('setActiveNoteIndex', index)
  },
  setActiveNoteId (context, id) {
    this.commit('setActiveNoteId', id)
  },
  addNoteToHistory (context, id) {
    if (state.history[state.history.length - 1].n === id) {
      return
    }
    this.commit('addNoteToHistory', id)
    this.dispatch('updateHistory')
  },
  showNoteContextMenu (context, id) {
    noteContextMenu.popup(remote.getCurrentWindow())
  },
  goToNextNote (context) {
    if (state.activeNoteIndex === state.notes.length - 1) {
      this.commit('setActiveNoteIndex', 0)
    } else {
      this.commit('setActiveNoteIndex', state.activeNoteIndex + 1)
    }
    this.commit('setActiveNoteId', state.notes[state.activeNoteIndex]._id)
    this.dispatch('scrollToActiveNote')
  },
  goToPreviousNote (context) {
    if (state.activeNoteIndex === 0) {
      this.commit('setActiveNoteIndex', state.notes.length - 1)
    } else {
      this.commit('setActiveNoteIndex', state.activeNoteIndex - 1)
    }
    this.commit('setActiveNoteId', state.notes[state.activeNoteIndex]._id)
    this.dispatch('scrollToActiveNote')
  },
  scrollToActiveNote (context) {
    const href = '#note_index_' + state.activeNoteIndex
    const el = href ? document.querySelector(href) : null
    if (el) {
      document.querySelector('#notes').scrollTop = el.offsetTop
    }
  },
  loadHistory (context) {
    db.findOne({doctype: 'history'}, (err, doc) => {
      if (err) {
        console.log(err)
      }
      this.commit('setHistory', doc.data)
    })
  },
  updateHistory (context) {
    db.update({doctype: 'history'}, { $set: { data: state.history } })
  },
  copyText (context) {
    let selectedText = window.getSelection().getRangeAt(0).toString()
    clipboard.writeText(selectedText)
  }

}

function copyObject (obj) {
  return JSON.parse(JSON.stringify(obj))
}

function genPassword (len = 32) {
  var text = ''
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789012345678901234567890123456789'
  for (var i = 0; i < len; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

function remapString (str, from, to) {
  const keymap = {
    en: [
      'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '\\[', '\\]',
      'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\'',
      'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '\\.'
    ],
    ru: [
      'й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ',
      'ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э',
      'я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю'
    ]
  }
  for (let i = 0; i < keymap[from].length; i++) {
    let reg = new RegExp(keymap[from][i], 'mig')
    str = str.replace(reg, (a) => {
      return a === a.toLowerCase() ? keymap[to][i] : keymap[to][i].toUpperCase()
    })
  }

  return str
}

RegExp.quote = (str) => {
  return str.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1')
}

function highlightNotes () {
  let markInstance = new Mark(document.querySelector('.notes'))
  let options = ['separateWordSearch']
  let keyword = state.searchQuery + ' ' +
    remapString(state.searchQuery, 'en', state.settings.localKeymap) + ' ' +
    remapString(state.searchQuery, state.settings.localKeymap, 'en')
  markInstance.unmark({
    done: () => {
      markInstance.mark(keyword, options)
    }
  })
}

export default {
  state,
  mutations,
  getters,
  actions
}
