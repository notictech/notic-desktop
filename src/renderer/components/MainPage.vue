<template>
  <b-container fluid class="screen notes">
    <div class="topbar">
      <div class="row">
        <div class="col-6">
          <b-button-group>
            <b-btn variant="primary" @click="openAddNotePage()" v-b-tooltip.hover.auto title="Add note (Ctrl+N)"><icon name="plus"></icon></b-btn>
          </b-button-group>
          <b-button-group>
            <b-btn variant="primary" v-b-tooltip.hover.auto title="Clips (Ctrl+K)"><icon name="clipboard"></icon></b-btn>
          </b-button-group>
        </div>
        <div class="col-6">
          <b-input-group>
            <b-form-input type="search" class="text-left" placeholder="Search" autofocus @input="searchNotes($event)" ref="search"></b-form-input>
            <b-button-group>
              <b-button><icon name="sticky-note"></icon></b-button>
              <b-button><icon name="trash"></icon></b-button>
            </b-button-group>
          </b-input-group>
        </div>
      </div>
    </div>
    <div class="sidebar">
      <b-button-group vertical class="notes-links">
        <note-link v-for="note in notes" :note="note" :key="note._id"></note-link>
      </b-button-group>
    </div>
    <div class="notes">
      <note v-for="note in notes" :note="note" :key="note._id"></note>
    </div>
  </b-container>
</template>

<script>
  import Icon from '../../../node_modules/vue-awesome/components/Icon.vue'
  import Note from '../components/MainPage/Note.vue'
  import NoteLink from '../components/MainPage/NoteLink.vue'

  export default {
    name: 'main-page',
    components: { Icon, Note, NoteLink },
    computed: {
      notes () {
        return this.$store.getters.notes
      }
    },
    mounted () {
      this.$refs.search.focus()
      this.$store.dispatch('initDb', () => {
        this.searchNotes('')
      })
    },
    methods: {
      searchNotes (event) {
        this.$store.dispatch('searchNotes', event)
      },
      openAddNotePage () {
        this.$store.dispatch('openAddNotePage')
        this.$router.replace('/editor')
      }
    }
  }
</script>

<style></style>
