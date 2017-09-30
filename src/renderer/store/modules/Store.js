const Datastore = require('nedb')
let db

const state = {
  page: '/',
  editorMode: 'add',
  settings: {
    dbPath: 'default.ntc'
  },
  notes: []
}

const mutations = {
  set: (state, param, value) => {
    state[param] = value
  },
  updateNotes: (state, data) => {
    state.notes = data
  }
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
    db.find({doctype: 'note', title: new RegExp(query, 'i')}, (err, docs) => {
      if (err) {
        console.log(err)
      }
      this.commit('updateNotes', docs)
    })
  },
  openAddNotePage () {
    this.commit('set', 'editorMode', 'add')
  }
}

export default {
  state,
  mutations,
  getters,
  actions
}
