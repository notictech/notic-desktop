import menus from '../../../menu'
import bus from '../../../renderer/bus'

const $ = require('jquery')
const remote = require('electron').remote
const Datastore = require('nedb')
const moment = require('moment')
const Mark = require('mark.js')
const {clipboard} = require('electron')
const {ipcRenderer} = require('electron')
const qr = require('qr-image')
const CryptoJS = require('crypto-js')
const fs = require('fs')

let db

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
  reminderRepeat: '0',
  reminderRemoveNote: false,
  star: false,
  hidden: false
}

const state = {
  page: '/',
  searchFilter: 'notes',
  activeNoteIndex: null,
  activeNoteId: null,
  editorMode: 'add',
  editorInitTab: 0,
  masterPassword: null,
  exportedNotesPassword: null,
  settings: {
    dbPath: 'default.ntc',
    localKeymap: 'ru',
    historyMaxLength: 50,
    logoutAfter: 0,
    eraseClipboardAfter: 0,
    windowOnTop: 0,
    darkTheme: 0,
    animationSpeed: 0
  },
  notes: [],
  note: {},
  searchQuery: '',
  history: [],
  notifications: [],
  historyIndex: 0,
  appJustStarted: true,
  noteIsModified: false,
  windowMustBeHidden: false,
  misc: {
    recentNoteId: null
  },
  reminders: [],
  qr: null,
  exportedNotes: null,
  notificationsIsUnread: false,
  loadedNotesCount: 0,
  loadedNotesLinksCount: 0,
  isLoggedIn: false,
  lastUsingTime: null,
  contextNoteId: null,
  contextNoteIsDeleted: null,
  massSelect: false,
  selectedNotes: [],
  dateFilterActive: false,
  dateFilterTarget: 'created',
  dateFilterPrep: 'at',
  dateFilterDate1: moment().format('YYYY-MM-DD'),
  dateFilterDate2: moment('2016-01-01').format('YYYY-MM-DD'),
  needFocusOn: null,
  markPos: 0,
  marksCount: 0,
  needScroll: false,
  pagerPage: 1,
  pagerNotesPerPage: 30,
  pagerPagesCount: 0,
  pagerCurrentPageCount: 0,
  historyTransition: false,
  needReload: false,
  preventSearch: false,
  searchCmd: null
}

const mutations = {
  setSearchCmd: (state, data) => { state.searchCmd = data },
  setPreventSearch: (state, data) => { state.preventSearch = data },
  setNeedReload: (state, data) => { state.needReload = data },
  setHistoryTransition: (state, data) => { state.historyTransition = data },
  setPagerCurrentPageCount: (state, data) => { state.pagerCurrentPageCount = data },
  setPagerPagesCount: (state, data) => { state.pagerPagesCount = data },
  setPagerPage: (state, data) => { state.pagerPage = data },
  addNoteToSelected: (state, id) => {
    if (!state.selectedNotes.includes(id)) {
      state.selectedNotes.push(id)
    }
  },
  removeNoteFromSelected: (state, id) => {
    state.selectedNotes = state.selectedNotes.filter(e => e !== id)
  },
  emptySelectedNotes: (state) => {
    state.selectedNotes = []
  },
  setContextNoteIsDeleted: (state, data) => { state.contextNoteIsDeleted = data },
  setNeedScroll: (state, data) => { state.needScroll = data },
  setMarkPos: (state, data) => { state.markPos = data },
  setMarksCount: (state, data) => { state.marksCount = data },
  toggleDateFilter: (state) => { state.dateFilterActive = !state.dateFilterActive },
  toggleMassSelect: (state) => { state.massSelect = !state.massSelect },
  setNeedFocusOn: (state, data) => { state.needFocusOn = data },
  setContextNoteId: (state, data) => { state.contextNoteId = data },
  setDateFilterActive: (state, data) => { state.dateFilterActive = data },
  setDateFilterTarget: (state, data) => { state.dateFilterTarget = data },
  setDateFilterPrep: (state, data) => { state.dateFilterPrep = data },
  setDateFilterDate1: (state, data) => { state.dateFilterDate1 = data },
  setDateFilterDate2: (state, data) => { state.dateFilterDate2 = data },
  setEditorInitTab: (state, data) => { state.editorInitTab = data },
  setLastUsingTime: (state, data) => { state.lastUsingTime = data },
  setEraseClipboardAfter: (state, data) => { state.settings.eraseClipboardAfter = data },
  setAnimationSpeed: (state, data) => { state.settings.animationSpeed = data },
  setLogoutAfter: (state, data) => { state.settings.logoutAfter = data },
  setHistoryMaxLength: (state, data) => { state.settings.historyMaxLength = data },
  setLocalKeymap: (state, data) => { state.settings.localKeymap = data },
  setSettingsData: (state, data) => { state.settings = data },
  setDbPath: (state, data) => { state.settings.dbPath = data },
  setDarkTheme: (state, data) => { state.settings.darkTheme = data },
  setWindowOnTop: (state, data) => { state.settings.windowOnTop = data },
  setIsLoggedIn: (state, data) => { state.isLoggedIn = data },
  setMasterPassword: (state, data) => { state.masterPassword = data },
  setExportedNotesPassword: (state, data) => { state.exportedNotesPassword = data },
  setWindowMustBeHidden: (state, data) => { state.windowMustBeHidden = data },
  setNoteIsModified: (state, data) => { state.noteIsModified = data },
  setActiveNoteIndex: (state, data) => { state.activeNoteIndex = data },
  setActiveNoteId: (state, data) => { state.activeNoteId = data },
  setRecentNoteId: (state, data) => { state.misc.recentNoteId = data },
  setEditorMode: (state, data) => { state.editorMode = data },
  updateNotes: (state, data) => { state.notes = data },
  updateNote: (state, data) => {
    state.note = data
  },
  updateNoteTitle: (state, data) => { state.note.title = data },
  updateNoteContent: (state, data) => { state.note.content = data },
  setNoteCreatedAt: (state, data) => { state.note.createdAt = data },
  setNoteUpdatedAt: (state, data) => { state.note.updatedAt = data },
  setNoteReminder: (state, data) => { state.note.reminder = data },
  setNoteReminderDate: (state, data) => { state.note.reminderDate = data },
  setNoteReminderTime: (state, data) => { state.note.reminderTime = data },
  setNoteReminderByIndex: (state, obj) => { state.notes[obj.index].reminder = obj.data },
  setNoteReminderDateByIndex: (state, obj) => { state.notes[obj.index].reminderDate = obj.data },
  setNoteReminderTimeByIndex: (state, obj) => { state.notes[obj.index].reminderTime = obj.data },
  toggleNoteStar (state, index) {
    state.notes[index].star = !state.notes[index].star
  },
  markNotificationRead (state, index) {
    state.notifications[index].unread = false
  },
  addSecretToNote: (state) => {
    let secret = genPassword()
    let title = 'password'
    let titles = state.note.secrets.map((item) => {
      return item.title
    })
    let num = state.note.secrets.length
    while (titles.includes(title)) {
      title = 'password ' + num
      num++
    }
    state.note.secrets.push({
      title: title,
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
  toggleHideContent (state) {
    state.note.hidden = !state.note.hidden
  },
  toggleNoteReminderRemoveNote (state) {
    state.note.reminderRemoveNote = !state.note.reminderRemoveNote
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
  setHistoryIndex: (state, data) => { state.historyIndex = data },
  addNoteToHistory: (state, id) => {
    if (state.history.length === state.settings.historyMaxLength - 1) {
      state.history.shift()
    }
    let data = {
      q: state.searchQuery,
      f: state.searchFilter,
      i: id
    }
    if (state.dateFilterActive) {
      data.df = state.dateFilterActive
      data.dft = state.dateFilterTarget
      data.dfp = state.dateFilterPrep
      data.dfd1 = state.dateFilterDate1
      data.dfd2 = state.dateFilterDate2
    }
    state.history.push(data)
  },
  deleteFromHistory: (state, id) => {
    for (let i = 0; i < state.history.length; i++) {
      if (state.history[i].i === id) {
        state.history.splice(i, 1)
        i--
      }
    }
    // remove duplicates
    for (let i = 0; i < state.history.length; i++) {
      if (i > 0 && state.history[i].i === state.history[i - 1].i) {
        state.history.splice(i, 1)
        i = 0
      }
    }
  },
  setMiscData: (state, data) => { state.misc = data },
  setReminders: (state, data) => { state.reminders = data },
  setNotifications: (state, data) => { state.notifications = data },
  setAppJustStarted: (state, data) => {
    state.appJustStarted = data
  },
  setQr: (state, data) => {
    state.qr = data
  },
  setExportedNotes: (state, data) => {
    state.exportedNotes = data
  },
  setNotificationsIsUnread: (state, data) => { state.notificationsIsUnread = data }

}

const getters = {
  getAbsoluteNoteIndex: (state) => (index) => {
    return (state.pagerPage - 1) * state.pagerNotesPerPage + index
  },
  notes: state => {
    return state.notes
  },
  notifications: state => { return state.notifications },
  searchQuery: state => {
    return state.searchQuery
  },
  searchFilter: state => {
    return state.searchFilter
  },
  getNoteIndexById: (state) => (id) => {
    let index
    for (let i = 0; i < state.notes.length; i++) {
      if (state.notes[i]._id === id) {
        index = i
        break
      }
    }
    return index
  }
}

const actions = {
  initDb (context, callback) {
    db = new Datastore({
      filename: context.state.settings.dbPath,
      autoload: false,
      beforeDeserialization (data) {
        if (state.masterPassword === '') {
          return data
        }
        try {
          let bytes = CryptoJS.AES.decrypt(data, state.masterPassword)
          let decrypted = bytes.toString(CryptoJS.enc.Utf8)
          return decrypted
        } catch (e) {
          return data
        }
      },
      afterSerialization (data) {
        if (state.masterPassword === '') {
          return data
        }
        try {
          var encrypted = CryptoJS.AES.encrypt(data, state.masterPassword)
          return encrypted
        } catch (e) {
          return data
        }
      }
    })
    db.loadDatabase((err) => {
      if (err) {
        this.commit('setMasterPassword', null)
        this.commit('setIsLoggedIn', false)
        ipcRenderer.send('set-tray-icon-inactive')
        if (fs.existsSync(state.settings.dbPath)) {
          bus.$emit('enterMasterPassword')
        }
      } else {
        this.commit('setIsLoggedIn', true)
        ipcRenderer.send('set-tray-icon-normal')
      }
    })
    db.count({}, (err, count) => {
      if (err) {
        console.log('ERROR: ' + err)
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
        db.insert({doctype: 'misc', data: state.misc})
      }
      callback()
    })
  },
  searchNotes (context, obj) {
    this.commit('setSearchQuery', obj.query)
    let queryWords = obj.query.trim().split(' ')
    let and = []
    for (let i = 0; i < queryWords.length; i++) {
      let or = []
      or.push({title: new RegExp(RegExp.quote(queryWords[i]), 'i')})
      or.push({title: new RegExp(remapString(RegExp.quote(queryWords[i]), 'en', state.settings.localKeymap), 'i')})
      or.push({title: new RegExp(remapString(RegExp.quote(queryWords[i]), state.settings.localKeymap, 'en'), 'i')})
      or.push({content: new RegExp(RegExp.quote(queryWords[i]), 'i')})
      or.push({content: new RegExp(remapString(RegExp.quote(queryWords[i]), 'en', state.settings.localKeymap), 'i')})
      or.push({content: new RegExp(remapString(RegExp.quote(queryWords[i]), state.settings.localKeymap, 'en'), 'i')})
      or.push({$where: function () {
        if (!this.secrets) {
          return false
        }
        if (!this.secrets.length) {
          return false
        }
        for (let j = 0; j < this.secrets.length; j++) {
          if (this.secrets[j].title.match(new RegExp(RegExp.quote(queryWords[i]), 'i'))) {
            return true
          }
          if (this.secrets[j].title.match(new RegExp(remapString(RegExp.quote(queryWords[i]), 'en', state.settings.localKeymap), 'i'))) {
            return true
          }
          if (this.secrets[j].title.match(new RegExp(remapString(RegExp.quote(queryWords[i]), state.settings.localKeymap, 'en'), 'i'))) {
            return true
          }
        }
        return false
      }})
      or.push({$where: function () {
        if (moment(this.createdAt).format('DD.MM.YYYY').match(new RegExp(RegExp.quote(queryWords[i]), 'i'))) {
          return true
        }
        if (moment(this.createdAt).format('DD.MM.YYYY').match(new RegExp(remapString(RegExp.quote(queryWords[i]), 'en', state.settings.localKeymap), 'i'))) {
          return true
        }
        if (moment(this.createdAt).format('DD.MM.YYYY').match(new RegExp(remapString(RegExp.quote(queryWords[i]), state.settings.localKeymap, 'en'), 'i'))) {
          return true
        }
        return false
      }})
      or.push({$where: function () {
        if (moment(this.updatedAt).format('DD.MM.YYYY').match(new RegExp(RegExp.quote(queryWords[i]), 'i'))) {
          return true
        }
        if (moment(this.updatedAt).format('DD.MM.YYYY').match(new RegExp(remapString(RegExp.quote(queryWords[i]), 'en', state.settings.localKeymap), 'i'))) {
          return true
        }
        if (moment(this.updatedAt).format('DD.MM.YYYY').match(new RegExp(remapString(RegExp.quote(queryWords[i]), state.settings.localKeymap, 'en'), 'i'))) {
          return true
        }
        return false
      }})
      or.push({$where: function () {
        if (moment(this.reminderDate).format('DD.MM.YYYY').match(new RegExp(RegExp.quote(queryWords[i]), 'i'))) {
          return true
        }
        if (moment(this.reminderDate).format('DD.MM.YYYY').match(new RegExp(remapString(RegExp.quote(queryWords[i]), 'en', state.settings.localKeymap), 'i'))) {
          return true
        }
        if (moment(this.reminderDate).format('DD.MM.YYYY').match(new RegExp(remapString(RegExp.quote(queryWords[i]), state.settings.localKeymap, 'en'), 'i'))) {
          return true
        }
        return false
      }})
      and.push({$or: or})
    }

    if (state.searchFilter === 'notes') {
      and.push({deleted: false})
    } else if (state.searchFilter === 'deleted') {
      and.push({deleted: true})
    } else if (state.searchFilter === 'reminder') {
      and.push({reminder: true, deleted: false})
    } else if (state.searchFilter === 'star') {
      and.push({star: true, deleted: false})
    } else if (state.searchFilter === 'secrets') {
      and.push({$not: {secrets: { $size: 0 }}, deleted: false})
    }

    and.push({doctype: 'note'})

    if (state.dateFilterActive) {
      if (state.dateFilterTarget === 'created') {
        if (state.dateFilterPrep === 'at') {
          and.push({$where: function () {
            if (moment(this.createdAt).format('YYYY-MM-DD') === state.dateFilterDate1) {
              return true
            }
            return false
          }})
        } else if (state.dateFilterPrep === 'between') {
          and.push({$where: function () {
            let date1 = moment(state.dateFilterDate1).add(23, 'hours').add(59, 'minutes').valueOf()
            let date2 = moment(state.dateFilterDate2)
            if (this.createdAt <= date1 && this.createdAt >= date2) {
              return true
            }
            return false
          }})
        }
      }
      if (state.dateFilterTarget === 'updated') {
        if (state.dateFilterPrep === 'at') {
          and.push({$where: function () {
            if (moment(this.updatedAt).format('YYYY-MM-DD') === state.dateFilterDate1) {
              return true
            }
            return false
          }})
        } else if (state.dateFilterPrep === 'between') {
          and.push({$where: function () {
            let date1 = moment(state.dateFilterDate1).add(23, 'hours').add(59, 'minutes').valueOf()
            let date2 = moment(state.dateFilterDate2)
            if (this.updatedAt <= date1 && this.updatedAt >= date2) {
              return true
            }
            return false
          }})
        }
      }
      if (state.dateFilterTarget === 'reminder') {
        if (state.dateFilterPrep === 'at') {
          and.push({$where: function () {
            if (!this.reminder) return false
            if (moment(this.reminderDate).format('YYYY-MM-DD') === state.dateFilterDate1) {
              return true
            }
            return false
          }})
        } else if (state.dateFilterPrep === 'between') {
          and.push({$where: function () {
            if (!this.reminder) return false
            let date1 = moment(state.dateFilterDate1).add(23, 'hours').add(59, 'minutes').valueOf()
            let date2 = moment(state.dateFilterDate2)
            if (this.reminderDate <= date1 && this.reminderDate >= date2) {
              return true
            }
            return false
          }})
        }
      }
    }

    let cond = {$and: and}

    db.find(cond).sort({createdAt: -1}).exec((err, docs) => {
      if (err) {
        console.log('ERROR: ' + err)
      }
      this.commit('updateNotes', docs)
      if (docs.length) {
        if (!state.historyTransition) {
          this.commit('setPagerPagesCount', Math.ceil(docs.length / state.pagerNotesPerPage))
          this.commit('setPagerPage', 1)
          this.commit('setActiveNoteIndex', 0)
          this.commit('setActiveNoteId', docs[0]._id)
          this.commit('setMarkPos', 0)
          this.commit('emptySelectedNotes')
        }
        this.commit('setHistoryTransition', false)
        if (obj.cb) obj.cb()
      }
    })
  },
  highlightNotes (context) {
    let markInstance = new Mark(document.querySelector('.notes .notes'))
    let options = ['separateWordSearch']
    let keyword = state.searchQuery + ' ' +
      remapString(state.searchQuery, 'en', state.settings.localKeymap) + ' ' +
      remapString(state.searchQuery, state.settings.localKeymap, 'en')
    markInstance.unmark({
      done: () => {
        markInstance.mark(keyword, options)
        let marks = document.getElementsByTagName('mark')
        if (marks.length) {
          this.commit('setMarksCount', marks.length)
          marks[0].classList.add('active')
          this.dispatch('defineFirstMark')
        } else {
          this.commit('setMarksCount', 0)
        }
      }
    })
  },
  actionDeleteNote (context, id) {
    db.remove({ _id: id }, {}, () => {
      this.commit('deleteFromHistory', id)
      if (state.misc.recentNoteId === id) {
        this.commit('setRecentNoteId', null)
        this.dispatch('updateMiscData')
      }
      this.dispatch('updateHistory')
      this.dispatch('searchNotes', {query: state.searchQuery})
    })
  },
  cloneNote (context, id) {
    db.findOne({_id: id}, (err, doc) => {
      if (err) console.log('ERROR: ' + err)
      let clone = doc
      clone.createdAt = moment().valueOf()
      clone.updatedAt = clone.createdAt
      delete clone._id
      db.insert(clone, (err, newDoc) => {
        if (err) console.log('ERROR: ' + err)
        this.dispatch('addNoteToHistory', newDoc._id)
        this.commit('setRecentNoteId', newDoc._id)
        this.dispatch('updateMiscData')
        this.dispatch('searchNotes', {
          query: state.searchQuery,
          cb: () => {
            this.dispatch('scrollToActiveNoteLink')
            this.dispatch('scrollToActiveNote')
            this.dispatch('defineFirstMark')
          }
        })
        this.commit('setHistoryTransition', false)
      })
    })
  },
  actionMarkNoteAsDeleted (context, id) {
    db.update({ _id: id }, { $set: { deleted: true } }, () => {
      this.commit('deleteFromHistory', id)
      this.dispatch('updateHistory')
      this.dispatch('loadReminders')
      this.dispatch('searchNotes', {query: state.searchQuery})
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
  openAddNoteFromClipboardPage (context) {
    this.dispatch('openAddNotePage')
    let content = clipboard.readText()
    this.commit('updateNoteContent', content)
    this.commit('updateNoteTitle', '#clipboard ' + content.substr(0, 30) + '...')
  },
  editReminderFromNotifications (context, id) {
    db.count({_id: id}, (err, count) => {
      if (err) console.log('ERROR: ' + err)
      if (count === 0) {
        alert('Oops.. this note was deleted.')
        return false
      }
      this.dispatch('openEditNotePage', id)
      bus.$emit('openEditor')
    })
  },
  openEditNotePage (context, id) {
    db.findOne({_id: id}, (err, doc) => {
      if (err) console.log('ERROR: ' + err)

      for (let i = 0; i < doc.secrets.length; i++) {
        doc.secrets[i].contentRepeat = doc.secrets[i].content
        doc.secrets[i].visibility = false
        doc.secrets[i].errorNotEquals = null
        doc.secrets[i].errorTitleEmpty = null
      }

      this.commit('updateNote', doc)
      this.commit('setEditorMode', 'edit')
      this.commit('setRecentNoteId', id)
      this.dispatch('updateMiscData')
    })
  },
  openRecentNote (context) {
    this.dispatch('openEditNotePage', state.misc.recentNoteId)
  },
  editorChangeTitle (context, text) {
    this.commit('updateNoteTitle', text)
  },
  editorChangeContent (context, text) {
    this.commit('updateNoteContent', text)
  },
  editorSaveAndClose (context, successCallback) {
    // if (!state.note.content.length && state.note.secrets.length) {
    //   alert('Content must be not empty.')
    //   return
    // }
    if (state.note.secretsHaveErrors === false) {
      alert('Invalid secrets data.')
      return
    }

    let currentActiveNoteIndex = state.activeNoteIndex
    let currentActiveNoteId = state.activeNoteId

    this.commit('cleanNote')

    this.commit('updateNoteTitle', state.note.title.trim())
    this.commit('updateNoteContent', state.note.content.trim())

    if (!state.note.title.length) {
      this.commit('updateNoteTitle', '#untitled ' + state.note.content.substr(0, 30) + '...')
    }
    let now = moment()
    if (state.editorMode === 'add') {
      this.commit('setNoteCreatedAt', now.valueOf())
      this.commit('setNoteUpdatedAt', now.valueOf())
      db.insert(state.note, (err, newDoc) => {
        if (err) console.log('ERROR: ' + err)
        this.commit('updateNote', copyObject(blankNote))
        this.dispatch('addNoteToHistory', newDoc._id)
        this.commit('setRecentNoteId', newDoc._id)
        this.dispatch('updateMiscData')
        this.dispatch('loadReminders')
        this.dispatch('searchNotes', {
          query: state.searchQuery,
          cb: () => {
            successCallback()
          }
        })
        if (state.windowMustBeHidden) {
          this.commit('setWindowMustBeHidden', false)
          remote.BrowserWindow.getAllWindows()[0].minimize()
        }
      })
    } else {
      this.commit('setNoteUpdatedAt', now.valueOf())
      db.update({ _id: state.note._id }, state.note, {}, () => {
        this.dispatch('addNoteToHistory', state.note._id)
        this.dispatch('loadReminders')
        this.commit('updateNote', copyObject(blankNote))
        this.dispatch('searchNotes', {
          query: state.searchQuery,
          cb: () => {
            successCallback()
            this.commit('setActiveNoteIndex', currentActiveNoteIndex)
            this.commit('setActiveNoteId', currentActiveNoteId)
          }
        })
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
    this.commit('emptySelectedNotes')
    this.commit('setSearchFilter', filter)
    this.dispatch('searchNotes', {query: state.searchQuery})
  },
  restoreAllDeletedNotes (context) {
    db.update({doctype: 'note', deleted: true}, {$set: {deleted: false}}, {multi: true}, () => {
      this.commit('setSearchFilter', 'notes')
      this.dispatch('searchNotes', {query: state.searchQuery})
    })
  },
  emptyTrash (context) {
    db.find({doctype: 'note', deleted: true}, (err, docs) => {
      if (err) console.log('ERROR: ' + err)
      for (let i = 0; i < docs.length; i++) {
        this.commit('deleteFromHistory', docs[i]._id)
        if (state.misc.recentNoteId === docs[i]._id) {
          this.commit('setRecentNoteId', null)
        }
      }
      this.dispatch('updateHistory')
      this.dispatch('updateMiscData')
      db.remove({doctype: 'note', deleted: true}, {multi: true}, () => {
        this.commit('setSearchFilter', 'notes')
        this.dispatch('searchNotes', {query: state.searchQuery})
      })
    })
  },
  restoreDeletedNote (context, id) {
    db.update({ _id: id }, {$set: {deleted: false, createdAt: moment().valueOf(), updatedAt: moment().valueOf()}}, () => {
      this.dispatch('searchNotes', {query: state.searchQuery})
      this.dispatch('loadReminders')
    })
  },
  editorToggleReminder (context) {
    this.commit('toggleNoteReminder')
  },
  editorToggleHideContent (context) {
    this.commit('toggleHideContent')
  },
  editorToggleReminderRemoveNote (context) {
    this.commit('toggleNoteReminderRemoveNote')
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
    if (state.history.length && state.history[state.history.length - 1].i === id) {
      return
    }
    // let alreadyInHistory = false
    // for (let i = 0; i < state.history.length; i++) {
    //   if (state.history[i].i === id) {
    //     alreadyInHistory = true
    //   }
    // }
    // if (!alreadyInHistory) {
    //   this.commit('addNoteToHistory', id)
    //   this.dispatch('updateHistory')
    // }
    this.commit('addNoteToHistory', id)
    this.dispatch('updateHistory')
  },
  showNoteContextMenu (context, id) {
    this.commit('setContextNoteId', id)
    db.findOne({_id: id}, (err, doc) => {
      if (err) console.log('ERROR: ' + err)
      this.commit('setContextNoteIsDeleted', doc.deleted)
    })
    menus.noteContextMenu.popup(remote.getCurrentWindow())
  },
  goToNextNote (context, cb) {
    if (!state.notes.length) return
    if (state.activeNoteIndex === state.pagerCurrentPageCount - 1) {
      if (state.pagerPage < state.pagerPagesCount) {
        this.commit('setPagerPage', state.pagerPage + 1)
        this.commit('setActiveNoteIndex', 0)
      } else {
        return false
      }
    } else {
      this.commit('setActiveNoteIndex', state.activeNoteIndex + 1)
    }
    this.commit('setActiveNoteId', state.notes[this.getters.getAbsoluteNoteIndex(state.activeNoteIndex)]._id)
    cb()
  },
  goToPreviousNote (context, cb) {
    if (!state.notes.length) return
    if (state.activeNoteIndex === 0) {
      if (state.pagerPage > 1) {
        this.commit('setPagerPage', state.pagerPage - 1)
        this.commit('setActiveNoteIndex', state.pagerCurrentPageCount - 1)
      } else {
        return false
      }
    } else {
      this.commit('setActiveNoteIndex', state.activeNoteIndex - 1)
    }
    this.commit('setActiveNoteId', state.notes[this.getters.getAbsoluteNoteIndex(state.activeNoteIndex)]._id)
    cb()
  },
  goToNextMark (context, cb) {
    if (state.markPos < state.marksCount - 1) {
      this.commit('setMarkPos', state.markPos + 1)
    } else {
      this.commit('setMarkPos', 0)
    }
    let marks = document.getElementsByTagName('mark')
    if (marks.length) {
      this.commit('setMarksCount', marks.length)
      if (state.markPos > 0) {
        marks[state.markPos - 1].classList.remove('active')
      } else {
        marks[state.marksCount - 1].classList.remove('active')
      }
      marks[state.markPos].classList.add('active')
    }
    this.dispatch('scrollToActiveMark')
    this.dispatch('setActiveNoteByMark')
    this.dispatch('scrollToActiveNoteLink')
    if (cb) cb()
  },
  goToPreviousMark (context, cb) {
    if (state.markPos > 0) {
      this.commit('setMarkPos', state.markPos - 1)
    } else {
      this.commit('setMarkPos', state.marksCount - 1)
    }
    let marks = document.getElementsByTagName('mark')
    if (marks.length) {
      this.commit('setMarksCount', marks.length)
      if (state.markPos < state.marksCount - 1) {
        marks[state.markPos + 1].classList.remove('active')
      } else {
        marks[0].classList.remove('active')
      }
      marks[state.markPos].classList.add('active')
    }
    this.dispatch('scrollToActiveMark')
    this.dispatch('setActiveNoteByMark')
    this.dispatch('scrollToActiveNoteLink')
    if (cb) cb()
  },
  setActiveNoteByMark (context) {
    let noteElement = document.querySelector('mark.active')
    if (noteElement !== null) {
      let index
      if (noteElement.parentElement.parentElement.classList.contains('note')) {
        index = parseInt(noteElement.parentElement.parentElement.id.split('note_index_')[1])
      } else {
        index = parseInt(noteElement.parentElement.parentElement.parentElement.id.split('note_index_')[1])
      }
      this.dispatch('setActiveNoteId', state.notes[index]._id)
      this.dispatch('setActiveNoteIndex', index)
    }
  },
  defineFirstMark (context, cb) {
    let marks = document.querySelectorAll('mark')
    let index
    let done = false
    for (let i = 0; i < marks.length; i++) {
      if (marks[i].parentElement.parentElement.classList.contains('note')) {
        index = parseInt(marks[i].parentElement.parentElement.id.split('note_index_')[1])
      } else {
        index = parseInt(marks[i].parentElement.parentElement.parentElement.id.split('note_index_')[1])
      }
      marks[i].classList.remove('active')
      if (index === state.activeNoteIndex && !done) {
        marks[i].classList.add('active')
        this.commit('setMarkPos', i)
        done = true
      }
    }
    if (cb) cb()
  },
  scrollToActiveNote (context) {
    const href = '#note_index_' + state.activeNoteIndex
    const el = href ? document.querySelector(href) : null
    if (el) {
      if (state.settings.animationSpeed === 0) {
        document.querySelector('#notes').scrollTop = el.offsetTop
      } else {
        $('#notes').animate({ scrollTop: el.offsetTop }, state.settings.animationSpeed)
      }
    }
  },
  scrollToActiveNoteLink (context) {
    const href = '#notelink_index_' + state.activeNoteIndex
    const el = href ? document.querySelector(href) : null
    if (el) {
      if (state.settings.animationSpeed === 0) {
        document.querySelector('.sidebar').scrollTop = el.offsetTop - 200
      } else {
        $('.sidebar').animate({ scrollTop: el.offsetTop - 200 }, state.settings.animationSpeed)
      }
    }
  },
  scrollToActiveMark (context) {
    const el = document.querySelector('mark.active')
    if (el) {
      if (state.settings.animationSpeed === 0) {
        document.querySelector('#notes').scrollTop = el.offsetTop - 200
      } else {
        $('#notes').animate({ scrollTop: el.offsetTop - 200 }, state.settings.animationSpeed)
      }
    }
  },
  loadHistory (context) {
    db.findOne({doctype: 'history'}, (err, doc) => {
      if (err) {
        console.log('ERROR: ' + err)
      }
      this.commit('setHistory', doc.data)
      this.commit('setHistoryIndex', (state.history.length > 0) ? state.history.length - 1 : 0)
    })
  },
  updateHistory (context) {
    db.update({doctype: 'history'}, { $set: { data: state.history } })
  },
  clearHistory (context) {
    this.commit('setHistory', [])
    this.commit('setHistoryIndex', 0)
    this.commit('setRecentNoteId', null)
    this.dispatch('updateMiscData')
    this.dispatch('updateHistory')
  },
  loadMiscData (context) {
    db.findOne({doctype: 'misc'}, (err, doc) => {
      if (err) {
        console.log('ERROR: ' + err)
      }
      this.commit('setMiscData', doc.data)
    })
  },
  updateMiscData (context) {
    db.update({doctype: 'misc'}, { $set: { data: state.misc } })
  },
  loadReminders (context) {
    db.find({deleted: false, reminder: true}, {
      _id: 1,
      reminderDate: 1,
      reminderTime: 1,
      reminderRepeat: 1,
      reminderRemoveNote: 1
    }, (err, docs) => {
      if (err) {
        console.log('ERROR: ' + err)
      }
      this.commit('setReminders', docs)
      // console.log('remainders are loaded ', docs)
    })
  },
  checkReminders (context) {
    for (let i = 0; i < state.reminders.length; i++) {
      let reminder = copyObject(state.reminders[i])
      let currentTimestamp = moment().valueOf()
      let remindDateObj = moment(moment(reminder.reminderDate).format('YYYY-MM-DD') + ' ' + reminder.reminderTime)
      let remindTimestamp = remindDateObj.valueOf()

      if (currentTimestamp < remindTimestamp) {
        continue
      }

      if (reminder.reminderRepeat !== '0') {
        while (true) {
          remindDateObj = moment(moment(reminder.reminderDate).format('YYYY-MM-DD') + ' ' + reminder.reminderTime)
          remindTimestamp = remindDateObj.valueOf()
          let nextDate = remindDateObj.add(0, 'minute')
          if (reminder.reminderRepeat === '10') {
            nextDate = remindDateObj.add(1, 'minute')
          } else if (reminder.reminderRepeat === '20') {
            nextDate = remindDateObj.add(1, 'hour')
          } else if (reminder.reminderRepeat === '30') {
            nextDate = remindDateObj.add(1, 'day')
          } else if (reminder.reminderRepeat === '40') {
            nextDate = remindDateObj.add(1, 'week')
          } else if (reminder.reminderRepeat === '50') {
            nextDate = remindDateObj.add(1, 'month')
          } else if (reminder.reminderRepeat === '60') {
            nextDate = remindDateObj.add(1, 'year')
          }
          // console.log(moment().format('DD.MM.YYYY HH:mm'), nextDate.format('DD.MM.YYYY HH:mm'))
          if (currentTimestamp > nextDate) {
            reminder.reminderDate = nextDate.valueOf()
            reminder.reminderTime = nextDate.format('HH:mm')
          } else {
            break
          }
        }
      }

      const alarm = new Audio('static/sound/alarm1.wav')
      alarm.play()

      db.findOne({_id: reminder._id}, (err, doc) => {
        if (err) {
          console.log('ERROR: ' + err)
        }

        let msg = moment(reminder.reminderDate).format('DD.MM.YYYY') + ' at ' + reminder.reminderTime + '\n\r' + doc.title + '\n\r\n\r' + doc.content

        let notification = new Notification('', {
          body: safeTags(msg),
          icon: 'static/icons/notic-logo.png'
        })

        notification.onclick = () => {
          require('electron').remote.getCurrentWindow().webContents.send('open-notifications')
          require('electron').remote.getCurrentWindow().show()
        }

        console.log(notification)

        let notif = {
          'doctype': 'notification',
          'date': moment(reminder.reminderDate).format('DD.MM.YYYY') + ' at ' + reminder.reminderTime,
          'title': doc.title,
          'content': doc.content,
          'createdAt': moment().valueOf(),
          'unread': true,
          'noteId': doc._id
        }

        db.insert(notif, (err, newDoc) => {
          if (err) console.log('ERROR: ' + err)
          this.commit('setNotificationsIsUnread', true)
          this.dispatch('loadNotifications')
        })

        doc.reminder = false

        if (doc.reminderRepeat !== '0') {
          let nextDate = remindDateObj.add(0, 'minute')
          doc.reminder = true
          doc.reminderDate = nextDate.valueOf()
          doc.reminderTime = nextDate.format('HH:mm')
        }

        db.update({ _id: reminder._id }, doc, {}, () => {
          if (reminder._id === state.note._id) {
            this.commit('setNoteReminder', doc.reminder)
            this.commit('setNoteReminderDate', doc.reminderDate)
            this.commit('setNoteReminderTime', doc.reminderTime)
          }
          for (let i = 0; i < state.notes.length; i++) {
            if (state.notes[i]._id === doc._id) {
              this.commit('setNoteReminderByIndex', {index: i, data: doc.reminder})
              this.commit('setNoteReminderDateByIndex', {index: i, data: doc.reminderDate})
              this.commit('setNoteReminderTimeByIndex', {index: i, data: doc.reminderTime})
              break
            }
          }
          this.dispatch('loadReminders')

          if (doc.reminderRemoveNote) {
            this.dispatch('actionMarkNoteAsDeleted', doc._id)
          }
        })
      })
    }
  },
  copyText (context) {
    let selectedText = window.getSelection().getRangeAt(0).toString()
    clipboard.writeText(selectedText)
  },
  copyExportedNotes (context) {
    clipboard.writeText(state.exportedNotes)
  },
  editorPastePassword (context) {
    // if (document.activeElement.id !== 'contentTextArea') {
    //   return
    // }
    document.execCommand('insertText', false, genPassword())
  },
  editorPasteCurrentDateTime (context) {
    // if (document.activeElement.id !== 'contentTextArea') {
    //   return
    // }
    document.execCommand('insertText', false, moment().format('DD.MM.YYYY HH:mm'))
  },
  editorPasteLine (context) {
    if (document.activeElement.id !== 'contentTextArea') {
      return
    }
    document.execCommand('insertText', false, '---------------------------------\n')
  },
  editorPasteDoubleLine (context) {
    if (document.activeElement.id !== 'contentTextArea') {
      return
    }
    document.execCommand('insertText', false, '=================================\n')
  },
  editorRepeatLine (context) {
    if (document.activeElement.id !== 'contentTextArea') {
      return
    }
    document.execCommand('insertText', false, '\n' + getCurrentLineInTextarea(document.activeElement))
  },
  startClipboardCountdown (context) {
    if (state.settings.eraseClipboardAfter === 0) {
      return
    }
    setTimeout(() => {
      clipboard.writeText('')
    }, state.settings.eraseClipboardAfter * 1000)
  },
  showQR (context) {
    let clip = clipboard.readText()
    // let qrSvg = qr.image(clip, { type: 'svg' })
    let svgString = qr.imageSync(clip, { type: 'svg' })
    this.commit('setQr', svgString)
  },
  toggleNoteStar (context, obj) {
    db.update({_id: obj.id}, { $set: { star: !state.notes[obj.index].star } }, {}, (err, num) => {
      if (err) {
        console.log('ERROR: ' + err)
      }
      this.commit('toggleNoteStar', obj.index)
    })
  },
  historyForward (context, cb) {
    if (!state.history.length) return
    this.commit('setPreventSearch', true)
    if (state.historyIndex === state.history.length - 1 || state.historyIndex === state.history.length) {
      this.commit('setHistoryIndex', 0)
    } else {
      this.commit('setHistoryIndex', state.historyIndex + 1)
    }
    this.commit('setSearchFilter', state.history[state.historyIndex].f)
    if ('df' in state.history[state.historyIndex]) {
      this.commit('setDateFilterActive', state.history[state.historyIndex].df)
      this.commit('setDateFilterTarget', state.history[state.historyIndex].dft)
      this.commit('setDateFilterPrep', state.history[state.historyIndex].dfp)
      this.commit('setDateFilterDate1', state.history[state.historyIndex].dfd1)
      this.commit('setDateFilterDate2', state.history[state.historyIndex].dfd2)
    } else {
      this.commit('setDateFilterActive', false)
    }
    this.dispatch('searchNotes', {
      query: state.history[state.historyIndex].q,
      cb: () => {
        this.commit('setHistoryTransition', true)
        this.commit('setActiveNoteId', state.history[state.historyIndex].i)
        this.commit('setPagerPagesCount', Math.ceil(state.notes.length / state.pagerNotesPerPage))
        let localIndex = this.getters.getNoteIndexById(state.history[state.historyIndex].i)
        this.commit('setPagerPage', getPagerPageByNoteIndex(localIndex))
        this.commit('setActiveNoteIndex', localIndex % state.pagerNotesPerPage)
        this.commit('setMarkPos', 0)
        this.commit('emptySelectedNotes')
        if (cb) cb()
      }
    })
  },
  historyBack (context, cb) {
    if (!state.history.length) return
    this.commit('setPreventSearch', true)
    if (state.historyIndex === 0 || state.historyIndex >= state.history.length) {
      this.commit('setHistoryIndex', state.history.length - 1)
    } else {
      this.commit('setHistoryIndex', state.historyIndex - 1)
    }
    this.commit('setSearchFilter', state.history[state.historyIndex].f)
    if ('df' in state.history[state.historyIndex]) {
      this.commit('setDateFilterActive', state.history[state.historyIndex].df)
      this.commit('setDateFilterTarget', state.history[state.historyIndex].dft)
      this.commit('setDateFilterPrep', state.history[state.historyIndex].dfp)
      this.commit('setDateFilterDate1', state.history[state.historyIndex].dfd1)
      this.commit('setDateFilterDate2', state.history[state.historyIndex].dfd2)
    } else {
      this.commit('setDateFilterActive', false)
    }
    this.dispatch('searchNotes', {
      query: state.history[state.historyIndex].q,
      cb: () => {
        this.commit('setHistoryTransition', true)
        this.commit('setActiveNoteId', state.history[state.historyIndex].i)
        this.commit('setPagerPagesCount', Math.ceil(state.notes.length / state.pagerNotesPerPage))
        let localIndex = this.getters.getNoteIndexById(state.history[state.historyIndex].i)
        this.commit('setPagerPage', getPagerPageByNoteIndex(localIndex))
        this.commit('setActiveNoteIndex', localIndex % state.pagerNotesPerPage)
        this.commit('setMarkPos', 0)
        this.commit('emptySelectedNotes')
        if (cb) cb()
      }
    })
  },
  setAppJustStarted (context, data) {
    this.commit('setAppJustStarted', data)
  },
  historyBackEditor (context) {
    this.dispatch('historyBack', () => {
      this.commit('updateNote', copyObject(blankNote))
      this.dispatch('openEditNotePage', state.history[state.historyIndex].i)
    })
  },
  historyForwardEditor (context) {
    this.dispatch('historyForward', () => {
      this.commit('updateNote', copyObject(blankNote))
      this.dispatch('openEditNotePage', state.history[state.historyIndex].i)
    })
  },
  prevNoteEditor (context) {
    this.dispatch('goToPreviousNote', () => {
      this.commit('updateNote', copyObject(blankNote))
      this.dispatch('openEditNotePage', state.notes[state.activeNoteIndex]._id)
    })
  },
  nextNoteEditor (context) {
    this.dispatch('goToNextNote', () => {
      this.commit('updateNote', copyObject(blankNote))
      this.dispatch('openEditNotePage', state.notes[state.activeNoteIndex]._id)
    })
  },
  setNoteIsModified (context, data) {
    if (state.editorMode === 'edit') {
      this.commit('setNoteIsModified', data)
    }
  },
  loadNotifications (context) {
    db.find({doctype: 'notification'}).sort({createdAt: -1}).exec((err, docs) => {
      if (err) {
        console.log('ERROR: ' + err)
      }
      this.commit('setNotifications', docs)
      this.dispatch('checkNotifications')
    })
  },
  checkNotifications (context) {
    this.commit('setNotificationsIsUnread', false)
    for (let i = 0; i < state.notifications.length; i++) {
      if (state.notifications[i].unread) {
        this.commit('setNotificationsIsUnread', true)
        break
      }
    }
    if (!state.notificationsIsUnread) {
      ipcRenderer.send('set-tray-icon-normal')
    } else {
      ipcRenderer.send('set-tray-icon-notif')
    }
  },
  markNotificationRead (context, obj) {
    db.update({_id: obj.id}, { $set: { unread: false } }, {}, (err, num) => {
      if (err) {
        console.log('ERROR: ' + err)
      }
      this.commit('markNotificationRead', obj.index)
      this.dispatch('checkNotifications')
    })
  },
  readAllNotifications (context) {
    db.update({doctype: 'notification'}, { $set: { unread: false } }, {multi: true}, (err, num) => {
      if (err) {
        console.log('ERROR: ' + err)
      }
      this.dispatch('loadNotifications')
      this.dispatch('checkNotifications')
    })
  },
  deleteAllNotifications (context) {
    db.remove({doctype: 'notification'}, {multi: true}, () => {
      this.dispatch('loadNotifications')
    })
  },
  settingsSaveAndClose (context, successCallback) {
    this.dispatch('saveSettingsFile', successCallback)
  },
  saveSettingsFile (context, successCallback) {
    fs.writeFileSync('./notic_settings', JSON.stringify(state.settings, null, 2))
    successCallback()
  },
  loadSettingsFile (context, successCallback) {
    if (fs.existsSync('./notic_settings')) {
      require('fs').readFile('./notic_settings', (err, data) => {
        if (err) {
          console.log('ERROR: ' + err)
        }
        if (data) {
          this.commit('setSettingsData', JSON.parse(data))
          successCallback()
        }
      })
    }
  },
  loadOrCreateSettingsFile (context, nextStep) {
    if (!fs.existsSync('./notic_settings')) {
      this.dispatch('saveSettingsFile', () => {
        nextStep()
      })
    } else {
      this.dispatch('loadSettingsFile', () => {
        nextStep()
      })
    }
  },
  changeMasterPassword (context, obj) {
    let lineReader = require('readline').createInterface({
      input: require('fs').createReadStream(state.settings.dbPath)
    })
    let tempFileName = state.settings.dbPath + '.temp.' + moment().valueOf()
    lineReader.on('line', (line) => {
      let decrypted = (state.masterPassword === null) ? line : CryptoJS.AES
        .decrypt(line, state.masterPassword)
        .toString(CryptoJS.enc.Utf8)
      let encrypted = obj.newPassword === '' ? decrypted : CryptoJS.AES.encrypt(decrypted, obj.newPassword)
      fs.appendFile(tempFileName, encrypted + require('os').EOL, (err) => {
        if (err) {
          console.log('ERROR: ' + err)
        }
      })
    }).on('close', () => {
      fs.unlinkSync(state.settings.dbPath)
      fs.renameSync(tempFileName, state.settings.dbPath)
      this.commit('setMasterPassword', obj.newPassword === '' ? null : obj.newPassword)
      if (obj.cb) {
        obj.cb()
      }
    })
  },
  trackUsage (context) {
    this.commit('setLastUsingTime', moment().valueOf())
  },
  checkUsing (context) {
    if (state.settings.logoutAfter === 0) {
      return
    }
    if (state.lastUsingTime === null) {
      this.commit('setLastUsingTime', moment().valueOf())
    }
    if (moment().valueOf() - state.lastUsingTime >= state.settings.logoutAfter * 60000) {
      clipboard.writeText('')
      ipcRenderer.send('logout')
    }
  },
  logout (context) {
    clipboard.writeText('')
    ipcRenderer.send('logout')
  },
  toggleWindowOnTop (context, data) {
    this.commit('setWindowOnTop', data)
    require('electron').remote.getCurrentWindow().setAlwaysOnTop(!!data)
    this.dispatch('saveSettingsFile', () => {})
  },
  toggleDarkTheme (context, data) {
    this.commit('setDarkTheme', data)
    if (data) {
      $('body').addClass('dark-theme')
    } else {
      $('body').removeClass('dark-theme')
    }
    this.dispatch('saveSettingsFile', () => {})
  },
  fixWindowOnTop (context) {
    require('electron').remote.getCurrentWindow().setAlwaysOnTop(!!state.settings.windowOnTop)
  },
  selectNote (context, obj) {
    if (obj.value) {
      this.commit('addNoteToSelected', obj.id)
    } else {
      this.commit('removeNoteFromSelected', obj.id)
    }
  },
  encryptExportedNotesPassword (context, cb) {
    // let encrypted = CryptoJS.AES.encrypt(state.exportedNotes, state.exportedNotesPassword)
    let encrypted = state.exportedNotesPassword === '' ? state.exportedNotes : CryptoJS.AES.encrypt(state.exportedNotes, state.exportedNotesPassword).toString()
    this.commit('setExportedNotes', encrypted)
    cb()
  },
  importNotes (context, obj) {
    let importedNotes = null
    try {
      if (!obj.password.length) {
        importedNotes = JSON.parse(obj.importData)
      } else {
        let bytes = CryptoJS.AES.decrypt(obj.importData, obj.password)
        let decrypted = bytes.toString(CryptoJS.enc.Utf8)
        importedNotes = JSON.parse(decrypted)
      }
    } catch (e) {
      alert('Invalid import data.')
      return
    }
    if (importedNotes === null) {
      alert('Invalid import data.!')
    }
    let data = []
    for (let i = 0; i < importedNotes.length; i++) {
      let note = importedNotes[i]
      note.createdAt = moment().valueOf()
      note.updatedAt = note.createdAt
      data.push(note)
    }
    db.insert(data, (err, newDoc) => {
      if (err) console.log('ERROR: ' + err)
      this.dispatch('searchNotes', {query: state.searchQuery})
      obj.cb()
    })
  },
  checkSearchCmd (context) {
    if (!state.searchQuery.startsWith('/')) {
      this.commit('setSearchCmd', null)
      return false
    }
    this.commit('setSearchCmd', state.searchQuery)
  }
}

function copyObject (obj) {
  return JSON.parse(JSON.stringify(obj))
}

function genPassword (len = 32) {
  var text = ''
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789012345678901234567890123456789'
  var first = 'abcdefghijklmnopqrstuvwxyz'
  for (var i = 0; i < len; i++) {
    if (i === 0) {
      text += first.charAt(Math.floor(Math.random() * first.length))
      continue
    }
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

function safeTags (str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// function typeInTextarea (el, newText) {
//   let start = el.selectionStart
//   let end = el.selectionEnd
//   let text = el.value
//   let before = text.substring(0, start)
//   let after = text.substring(end, text.length)
//   el.value = (before + newText + after)
//   el.selectionStart = el.selectionEnd = start + newText.length
//   el.focus()
// }

function getCurrentLineInTextarea (el) {
  let caretPos = el.selectionEnd
  let start
  let end

  start = caretPos - 1
  while (el.value[start] !== '\n' && start >= 0) {
    start--
  }

  end = caretPos - 1
  while (el.value[end] !== '\n' && end <= el.value.length) {
    end++
  }

  let line = el.value.substring(start + 1, end)
  return line
}

RegExp.quote = (str) => {
  return str.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1')
}

function getPagerPageByNoteIndex (index) {
  let page = Math.ceil(index / state.pagerNotesPerPage)
  return (page === 0) ? 1 : page
}

export default {
  state,
  mutations,
  getters,
  actions
}
