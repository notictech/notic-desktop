const Datastore = require('nedb')
let db

const state = {
  page: '/',
  editorMode: 'add',
  settings: {
    dbPath: 'default.ntc'
  },
  notes: [],
  note: {
    doctype: 'note',
    title: '',
    content: '',
    createdAt: '',
    updatedAt: '',
    deleted: false
  },
  searchQuery: ''
}

const mutations = {
  set: (state, param, value) => {
    state[param] = value
  },
  updateNotes: (state, data) => {
    state.notes = data
  },
  updateNoteTitle: (state, text) => { state.note.title = text },
  updateNoteContent: (state, text) => { state.note.content = text }
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
    // var query = trim(query)
    // db.find({doctype: 'note', title: new RegExp(query, 'i')}, (err, docs) => {
    //   if (err) {
    //     console.log(err)
    //   }
    //   this.commit('updateNotes', docs)
    //   this.commit('set', 'searchQuery', query)
    // })
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
  openAddNotePage () {
    this.commit('set', 'editorMode', 'add')
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

    state.note.createdAt = state.note.updatedAt = new Date()

    db.insert(state.note, (err) => {
      if (err) console.log(err)
      this.dispatch('searchNotes', context.searchQuery)
      successCallback()
    })
  }
}

export default {
  state,
  mutations,
  getters,
  actions
}
