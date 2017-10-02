const Datastore = require('nedb')
let db

const blankNote = {
  doctype: 'note',
  title: '',
  content: '',
  createdAt: '',
  updatedAt: '',
  deleted: false
}

const state = {
  page: '/',
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
  setEditorMode: (state, data) => { state.editorMode = data },
  updateNotes: (state, data) => { state.notes = data },
  updateNote: (state, data) => { state.note = data },
  updateNoteTitle: (state, text) => { state.note.title = text },
  updateNoteContent: (state, text) => { state.note.content = text },
  setNoteCreatedAt: (state, text) => { state.note.createdAt = text },
  setNoteUpdatedAt: (state, text) => { state.note.updatedAt = text }
}

const getters = {
  notes: state => {
    return state.notes
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
          deleted: false
        })
      } else {
        callback()
      }
      callback()
    })
  },
  searchNotes (context, query) {
    db.find({doctype: 'note', title: new RegExp(query, 'i')}).sort({createdAt: -1}).exec((err, docs) => {
      if (err) {
        console.log(err)
      }
      this.commit('updateNotes', docs)
      this.commit('set', 'searchQuery', query)
    })
  },
  actionDeleteNote (context, id) {
    db.remove({ _id: id }, {}, () => {
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

    if (!state.note.title.length) {
      this.commit('updateNoteTitle', '#untitled ' + state.note.content.substr(0, 30) + '...')
    }
    let dateNow = new Date()
    this.commit('setNoteCreatedAt', dateNow)
    this.commit('setNoteUpdatedAt', dateNow)

    db.insert(state.note, (err) => {
      if (err) console.log(err)
      this.commit('updateNote', copyObject(blankNote))
      successCallback()
      this.dispatch('searchNotes', context.searchQuery)
    })
  }
}

function copyObject (obj) {
  return JSON.parse(JSON.stringify(obj))
}

export default {
  state,
  mutations,
  getters,
  actions
}
