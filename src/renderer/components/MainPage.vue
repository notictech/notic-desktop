<template>
    <b-container fluid class="screen notes" v-hotkey="keymap">
        <div class="topbar">
            <div class="row">
                <div class="col-6">
                    <b-button-group size="sm">
                        <b-btn variant="primary" @click="openAddNotePage()" v-b-tooltip.hover.auto title="Add note (Ctrl+N)"><icon name="plus"></icon></b-btn>
                    </b-button-group>
                    <b-button-group size="sm">
                        <b-btn variant="primary" v-b-tooltip.hover.auto title="Clips (Ctrl+K)"><icon name="clipboard"></icon></b-btn>
                    </b-button-group>
                    <b-button-group size="sm" v-show="searchFilter === 'deleted'">
                        <!--<b-btn variant="success" @click="restoreAllDeletedNotes()">Restore all</b-btn>-->
                        <b-btn variant="danger" @click="emptyTrash()">Empty trash</b-btn>
                    </b-button-group>
                </div>
                <div class="col-6">
                    <b-input-group size="sm">
                        <b-form-input type="search" class="text-left" placeholder="Search" autofocus @input="searchNotes($event)" ref="search"></b-form-input>
                        <b-button-group size="sm">
                            <b-button :class="['search-filter', {active: searchFilter == 'notes'}]" @click="setSearchFilter('notes')"><icon name="sticky-note"></icon></b-button>
                            <b-button :class="['search-filter', {active: searchFilter == 'reminder'}]" @click="setSearchFilter('reminder')"><icon name="bell-o"></icon></b-button>
                            <b-button :class="['search-filter', {active: searchFilter == 'deleted'}]" @click="setSearchFilter('deleted')"><icon name="trash"></icon></b-button>
                        </b-button-group>
                    </b-input-group>
                </div>
            </div>
        </div>
        <div class="sidebar">
            <b-button-group vertical class="notes-links">
                <note-link v-for="(note, index) in notes" :note="note" :key="note._id" :index="index"></note-link>
            </b-button-group>
        </div>
        <div class="notes" ref="notes" id="notes">
            <note v-for="(note, index) in notes" :note="note" :key="note._id" :index="index"></note>
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
    mounted () {
      this.$refs.search.focus()
      this.$store.dispatch('initDb', () => {
        this.$store.dispatch('loadHistory')
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
      },
      setSearchFilter (filter) {
        this.$store.dispatch('setSearchFilter', filter)
      },
      restoreAllDeletedNotes () {
        if (confirm('Are you sure you want to restore all deleted notes?')) {
          this.$store.dispatch('restoreAllDeletedNotes')
        }
      },
      emptyTrash () {
        if (confirm('Are you sure you want to empty trash?')) {
          this.$store.dispatch('emptyTrash')
        }
      },
      goToNextNote () {
        this.$store.dispatch('goToNextNote')
      },
      goToPreviousNote () {
        this.$store.dispatch('goToPreviousNote')
      }
    },
    computed: {
      keymap () {
        return {
          'ctrl+down': this.goToNextNote,
          'ctrl+up': this.goToPreviousNote
        }
      },
      notes () {
        return this.$store.getters.notes
      },
      searchFilter () {
        return this.$store.getters.searchFilter
      }
    }
  }
</script>

<style></style>
