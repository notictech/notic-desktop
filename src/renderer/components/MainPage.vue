<template>
  <b-container fluid class="screen notes">
    <div class="topbar">
      <div class="row">
        <div class="col-6">
          <b-button-group>
            <b-btn variant="primary" @click="openAddNotePage()"><icon name="plus"></icon></b-btn>
          </b-button-group>
          <b-button-group>
            <b-btn variant="primary"><icon name="clipboard"></icon></b-btn>
          </b-button-group>
        </div>
        <div class="col-6">
          <b-input-group>
            <b-form-input class="text-left" placeholder="Search" autofocus="true" @input="searchNotes($event)"></b-form-input>
            <b-button-group>
              <b-button variant="primary"><icon name="sticky-note"></icon></b-button>
              <b-button variant="primary"><icon name="trash"></icon></b-button>
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
