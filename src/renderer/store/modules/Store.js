import bus from '../../bus'

const {Menu} = require('electron').remote
const remote = require('electron').remote
const Datastore = require('nedb')
const moment = require('moment')
const Mark = require('mark.js')
const {clipboard} = require('electron')
const qr = require('qr-image')

let db

const noteContextMenu = Menu.buildFromTemplate([
  {
    label: 'Copy selected',
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
  reminderRepeat: '0',
  star: false
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
  history: [],
  notifications: [],
  historyIndex: 0,
  appJustStarted: true,
  noteIsModified: false,
  misc: {
    recentNoteId: null
  },
  reminders: [],
  qr: null,
  notificationsIsUnread: false,
  loadedNotesCount: 0,
  loadedNotesLinksCount: 0
}

const mutations = {
  setLoadedNotesCount: (state, date) => { state.loadedNotesCount = date },
  setLoadedNotesLinksCount: (state, date) => { state.loadedNotesLinksCount = date },
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
  setHistoryIndex: (state, data) => { state.historyIndex = data },
  addNoteToHistory: (state, id) => {
    if (state.history.length === state.settings.historyMaxLength - 1) {
      state.history.shift()
    }
    state.history.push({
      q: state.searchQuery,
      f: state.searchFilter,
      i: id
    })
  },
  deleteFromHistory: (state, id) => {
    for (let i = 0; i < state.history.length; i++) {
      if (state.history[i].i === id) {
        state.history.splice(i, 1)
        i--
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
  setNotificationsIsUnread: (state, data) => { state.notificationsIsUnread = data }

}

const getters = {
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
    }

    and.push({doctype: 'note'})

    let cond = {$and: and}

    db.find(cond).sort({createdAt: -1}).exec((err, docs) => {
      if (err) {
        console.log(err)
      }
      this.commit('updateNotes', docs)
      if (docs.length) {
        this.commit('setActiveNoteIndex', 0)
        this.commit('setActiveNoteId', docs[0]._id)
        this.commit('setLoadedNotesCount', 40)
        this.commit('setLoadedNotesLinksCount', 40)
        if (obj.cb) obj.cb()
      }
    })
  },
  highlightNotes (context) {
    let markInstance = new Mark(document.querySelector('.notes .note'))
    let options = ['separateWordSearch']
    let keyword = state.searchQuery + ' ' +
      remapString(state.searchQuery, 'en', state.settings.localKeymap) + ' ' +
      remapString(state.searchQuery, state.settings.localKeymap, 'en')
    markInstance.unmark({
      done: () => {
        markInstance.mark(keyword, options)
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
      db.insert(state.note, (err, newDoc) => {
        if (err) console.log(err)
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
      if (err) console.log(err)
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
    db.update({ _id: id }, {$set: {deleted: false}}, () => {
      this.dispatch('searchNotes', {query: state.searchQuery})
      this.dispatch('loadReminders')
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
    noteContextMenu.popup(remote.getCurrentWindow())
  },
  goToNextNote (context) {
    if (!state.notes.length) return
    if (state.activeNoteIndex === state.notes.length - 1) {
      this.commit('setActiveNoteIndex', 0)
    } else {
      this.commit('setActiveNoteIndex', state.activeNoteIndex + 1)
    }
    this.commit('setActiveNoteId', state.notes[state.activeNoteIndex]._id)
    this.dispatch('scrollToActiveNote')
  },
  goToPreviousNote (context) {
    if (!state.notes.length) return
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
  scrollToActiveNoteLink (context) {
    const href = '#notelink_index_' + state.activeNoteIndex
    const el = href ? document.querySelector(href) : null
    if (el) {
      document.querySelector('.sidebar').scrollTop = el.offsetTop
    }
  },
  loadHistory (context) {
    db.findOne({doctype: 'history'}, (err, doc) => {
      if (err) {
        console.log(err)
      }
      this.commit('setHistory', doc.data)
      this.commit('setHistoryIndex', (state.history.length > 0) ? state.history.length - 1 : 0)
    })
  },
  updateHistory (context) {
    db.update({doctype: 'history'}, { $set: { data: state.history } })
  },
  loadMiscData (context) {
    db.findOne({doctype: 'misc'}, (err, doc) => {
      if (err) {
        console.log(err)
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
      reminderRepeat: 1
    }, (err, docs) => {
      if (err) {
        console.log(err)
      }
      this.commit('setReminders', docs)
      // console.log('remainders are loaded ', docs)
    })
  },
  checkReminders (context) {
    for (let i = 0; i < state.reminders.length; i++) {
      let currentTimestamp = moment().valueOf()
      let remindDateObj = moment(moment(state.reminders[i].reminderDate).format('YYYY-MM-DD') + ' ' + state.reminders[i].reminderTime)
      let remindTimestamp = remindDateObj.valueOf()

      if (currentTimestamp < remindTimestamp) {
        continue
      }

      const alarm = new Audio('static/sound/alarm1.wav')
      alarm.play()

      db.findOne({_id: state.reminders[i]._id}, (err, doc) => {
        if (err) {
          console.log(err)
        }

        let msg = moment(state.reminders[i].reminderDate).format('DD.MM.YYYY') + ' at ' + state.reminders[i].reminderTime + '\n\r' + doc.title + '\n\r\n\r' + doc.content

        let notification = new Notification('', {
          body: msg,
          icon: 'static/icons/notic-logo.png'
        })

        // notification.onclick = () => {
        //   require('electron').remote.getCurrentWindow().webContents.send('notifications')
        //   require('electron').remote.getCurrentWindow().show()
        // }

        console.log(notification)

        let notif = {
          'doctype': 'notification',
          'date': moment(state.reminders[i].reminderDate).format('DD.MM.YYYY') + ' at ' + state.reminders[i].reminderTime,
          'title': doc.title,
          'content': doc.content,
          'createdAt': moment.valueOf(),
          'unread': true,
          'noteId': doc._id
        }
        db.insert(notif, (err, newDoc) => {
          if (err) console.log(err)
          this.commit('setNotificationsIsUnread', true)
        })

        doc.reminder = false

        if (doc.reminderRepeat !== '0') {
          let nextDate = remindDateObj.add(0, 'minute')
          if (state.reminders[i].reminderRepeat === '10') {
            nextDate = remindDateObj.add(1, 'minute')
          } else if (state.reminders[i].reminderRepeat === '20') {
            nextDate = remindDateObj.add(1, 'hour')
          } else if (state.reminders[i].reminderRepeat === '30') {
            nextDate = remindDateObj.add(1, 'day')
          } else if (state.reminders[i].reminderRepeat === '40') {
            nextDate = remindDateObj.add(1, 'week')
          } else if (state.reminders[i].reminderRepeat === '50') {
            nextDate = remindDateObj.add(1, 'month')
          } else if (state.reminders[i].reminderRepeat === '60') {
            nextDate = remindDateObj.add(1, 'year')
          }
          doc.reminder = true
          doc.reminderDate = nextDate.valueOf()
          doc.reminderTime = nextDate.format('HH:mm')
        }

        db.update({ _id: state.reminders[i]._id }, doc, {}, () => {
          if (state.reminders[i]._id === state.note._id) {
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
        })
      })
    }
  },
  copyText (context) {
    let selectedText = window.getSelection().getRangeAt(0).toString()
    clipboard.writeText(selectedText)
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
        console.log(err)
      }
      this.commit('toggleNoteStar', obj.index)
    })
  },
  historyForward (context, cb) {
    if (!state.history.length) return
    if (state.historyIndex === state.history.length - 1) {
      this.commit('setHistoryIndex', 0)
    } else {
      this.commit('setHistoryIndex', state.historyIndex + 1)
    }
    this.commit('setSearchFilter', state.history[state.historyIndex].f)
    this.dispatch('searchNotes', {
      query: state.history[state.historyIndex].q,
      cb: () => {
        this.commit('setActiveNoteId', state.history[state.historyIndex].i)
        this.commit('setActiveNoteIndex', this.getters.getNoteIndexById(state.history[state.historyIndex].i))
        if (cb) cb()
      }
    })
  },
  historyBack (context, cb) {
    if (!state.history.length) return
    if (state.historyIndex === 0) {
      this.commit('setHistoryIndex', state.history.length - 1)
    } else {
      this.commit('setHistoryIndex', state.historyIndex - 1)
    }
    this.commit('setSearchFilter', state.history[state.historyIndex].f)
    this.dispatch('searchNotes', {
      query: state.history[state.historyIndex].q,
      cb: () => {
        this.commit('setActiveNoteId', state.history[state.historyIndex].i)
        this.commit('setActiveNoteIndex', this.getters.getNoteIndexById(state.history[state.historyIndex].i))
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
  setNoteIsModified (context, data) {
    if (state.editorMode === 'edit') {
      this.commit('setNoteIsModified', data)
    }
  },
  loadNotifications (context) {
    db.find({doctype: 'notification'}).sort({createdAt: -1}).exec((err, docs) => {
      if (err) {
        console.log(err)
      }
      this.commit('setNotifications', docs)
      for (let i = 0; i < docs.length; i++) {
        if (docs[i].unread) {
          this.commit('setNotificationsIsUnread', true)
          break
        }
      }
    })
  },
  openNotificationsPage (context, id) {}
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

// function highlightNotes () {
//
// }

export default {
  state,
  mutations,
  getters,
  actions
}
