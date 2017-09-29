const state = {
  notes: [
    {
      _id: 'dec92md92f',
      title: 'Hello, Notic!',
      content: `Welcome! I'm your first note.\nYou can edit or delete me.`,
      createdAt: new Date(),
      updatedAt: new Date(),
      deleted: false
    }
  ]
}

const mutations = {

}

const getters = {
  notes: state => {
    return state.notes
  }
}

const actions = {

}

export default {
  state,
  mutations,
  getters,
  actions
}
