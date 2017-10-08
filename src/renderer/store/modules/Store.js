const Datastore = require('nedb')
let db

const blankNote = {
  doctype: 'note',
  title: '',
  content: '',
  createdAt: '',
  updatedAt: '',
  deleted: false,
  secrets: [],
  secretsHaveErrors: null
}

const state = {
  page: '/',
  searchFilter: 'notes',
  activeNoteId: null,
  editorMode: 'add',
  settings: {
    dbPath: 'default.ntc'
  },
  notes: [],
  note: {},
  searchQuery: ''
}

const mutations = {
  set: (state, param, value) => {
    state[param] = value
  },
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
  setSearchFilter (state, filter) {
    state.searchFilter = filter
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
        db.insert({
          doctype: 'note',
          title: 'Hello, Notic!',
          content: `Welcome! I'm your first note.\nYou can edit or delete me.`,
          createdAt: new Date(),
          updatedAt: new Date(),
          deleted: false,
          secrets: [
            {title: 'password', content: 'nE3LbJwKEm06xY98cp12y32508Du699f'},
            {title: 'another password', content: 'R46zq8xc0eTt90qGkQ1hKl1b7Jym621Y'}
          ]
        })
      } else {
        callback()
      }
      callback()
    })
  },
  searchNotes (context, query) {
    let cond = {doctype: 'note', title: new RegExp(query, 'i')}
    if (state.searchFilter === 'notes') {
      cond.deleted = false
    }
    if (state.searchFilter === 'deleted') {
      cond.deleted = true
    }
    db.find(cond).sort({createdAt: -1}).exec((err, docs) => {
      if (err) {
        console.log(err)
      }
      this.commit('updateNotes', docs)
      this.commit('set', 'searchQuery', query)
      this.commit('setActiveNoteId', docs[0]._id)
    })
  },
  actionDeleteNote (context, id) {
    db.remove({ _id: id }, {}, () => {
      this.dispatch('searchNotes', context.searchQuery)
    })
  },
  actionMarkNoteAsDeleted (context, id) {
    db.update({ _id: id }, { $set: { deleted: true } }, () => {
      this.dispatch('searchNotes', context.searchQuery)
    })
  },
  openAddNotePage (context) {
    this.commit('updateNote', copyObject(blankNote))
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
    if (state.editorMode === 'add') {
      let dateNow = new Date()
      this.commit('setNoteCreatedAt', dateNow)
      this.commit('setNoteUpdatedAt', dateNow)
      db.insert(state.note, (err) => {
        if (err) console.log(err)
        this.commit('updateNote', copyObject(blankNote))
        this.dispatch('searchNotes', context.searchQuery)
        successCallback()
      })
    } else {
      this.commit('setNoteUpdatedAt', new Date())
      db.update({ _id: state.note._id }, state.note, {}, () => {
        this.commit('updateNote', copyObject(blankNote))
        this.dispatch('searchNotes', context.searchQuery)
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
    this.dispatch('searchNotes', context.searchQuery)
  },
  restoreAllDeletedNotes (context) {
    db.update({doctype: 'note', deleted: true}, {$set: {deleted: false}}, {multi: true}, () => {
      this.commit('setSearchFilter', 'notes')
      this.dispatch('searchNotes', context.searchQuery)
    })
  },
  emptyTrash (context) {
    db.remove({doctype: 'note', deleted: true}, {multi: true}, () => {
      this.commit('setSearchFilter', 'notes')
      this.dispatch('searchNotes', context.searchQuery)
    })
  },
  restoreDeletedNote (context, id) {
    db.update({ _id: id }, {$set: {deleted: false}}, () => {
      this.dispatch('searchNotes', context.searchQuery)
    })
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

export default {
  state,
  mutations,
  getters,
  actions
}
