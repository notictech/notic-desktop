<template>
    <b-container fluid class="screen notes" v-hotkey="keymap" v-show="this.$store.state.Store.isLoggedIn">
        <b-modal size="sm" ref="modalQr" id="modal-qr" class="modal-qr" hide-footer title="QR from clipboard">
            <div class="my-4 qr" v-html="qr"></div>
        </b-modal>
        <div class="topbar">
            <div class="row">
                <div class="col-5">
                    <b-button-group size="sm">
                        <b-btn variant="primary" @click="openAddNotePage()" title="Add note (Ctrl+Space)"><icon name="plus"></icon></b-btn>
                    </b-button-group>
                    <b-button-group size="sm">
                        <b-btn variant="primary" @click="openRecentNote()" title="Open recent note (Ctrl+E)"><icon name="pencil-square-o"></icon></b-btn>
                    </b-button-group>
                    <b-button-group size="sm">
                        <b-btn variant="primary" @click="showQR()" title="QR from clipboard (Ctrl+Q)"><icon name="qrcode"></icon></b-btn>
                    </b-button-group>
                    <b-button-group size="sm">
                        <b-btn variant="primary" :variant="this.$store.state.Store.notificationsIsUnread ? 'danger' : 'primary' " @click="openNotificationsPage()" title="Notifications (Ctrl+N)"><icon name="bell"></icon></b-btn>
                    </b-button-group>
                    <b-button-group size="sm" v-show="searchFilter === 'deleted'">
                        <!--<b-btn variant="success" @click="restoreAllDeletedNotes()">Restore all</b-btn>-->
                        <b-btn variant="danger" @click="emptyTrash()">Empty trash</b-btn>
                    </b-button-group>
                </div>
                <div class="col-7">
                    <b-input-group size="sm">
                        <b-form-input type="search" class="text-left" placeholder="Search" autofocus @input="searchNotes($event)" ref="search" :value="searchQuery"></b-form-input>
                        <b-button-group size="sm" class="search-filters">
                            <b-button :variant="(searchFilter == 'notes') ? 'warning' : 'secondary'" title="Notes (Ctrl+1)" @click="setSearchFilter('notes')"><icon name="asterisk"></icon></b-button>
                            <b-button :variant="(searchFilter == 'secrets') ? 'warning' : 'secondary'" title="Secrets (Ctrl+2)" @click="setSearchFilter('secrets')"><icon name="key"></icon></b-button>
                            <b-button :variant="(searchFilter == 'star') ? 'warning' : 'secondary'" title="Favorites (Ctrl+3)" @click="setSearchFilter('star')"><icon name="star"></icon></b-button>
                            <b-button :variant="(searchFilter == 'reminder') ? 'warning' : 'secondary'" title="Reminders (Ctrl+4)" @click="setSearchFilter('reminder')"><icon name="bell"></icon></b-button>
                            <b-button :variant="(searchFilter == 'deleted') ? 'warning' : 'secondary'" title="Deleted (Ctrl+5)" @click="setSearchFilter('deleted')"><icon name="trash"></icon></b-button>
                        </b-button-group>
                        <b-button-group size="sm" style="margin-left: 10px">
                            <b-button title="History back (Ctrl+Left)" @click="historyBack()"><icon name="arrow-left"></icon></b-button>
                            <b-button title="History forward (Ctrl+Right)" @click="historyForward()"><icon name="arrow-right"></icon></b-button>
                        </b-button-group>
                    </b-input-group>
                </div>
            </div>
        </div>
        <div class="sidebar" @scroll="scrollNotes($event)">
            <b-button-group vertical class="notes-links" id="notes-links">
                <note-link v-for="(note, index) in notes.slice(0, loadedNotesLinksCount)" :note="note" :key="note._id" :index="index"></note-link>
            </b-button-group>
        </div>
        <div class="notes" ref="notes" id="notes" @scroll="scrollNotes($event)">
            <note v-for="(note, index) in notes.slice(0, loadedNotesCount)" :note="note" :key="note._id" :index="index"></note>
        </div>
        <div class="found-bar">
            Found: {{ notes.length }}
        </div>
    </b-container>
</template>

<script>
  import bus from '../bus'
  import Icon from '../../../node_modules/vue-awesome/components/Icon.vue'
  import Note from '../components/MainPage/Note.vue'
  import NoteLink from '../components/MainPage/NoteLink.vue'

  const fs = require('fs')

  export default {
    name: 'main-page',
    components: { Icon, Note, NoteLink },
    mounted () {
      let onMounted = () => {
        if (!fs.existsSync(this.$store.state.Store.settings.dbPath) && this.$store.state.Store.masterPassword === null) {
          this.$router.replace('/set-master-password')
          return
        }
        if (this.$store.state.Store.masterPassword === '') {
          this.$store.commit('setMasterPassword', null)
        }
        bus.$on('enterMasterPassword', () => {
          this.$router.replace('/enter-master-password')
        })
        bus.$on('openChangeMasterPassword', () => {
          this.$router.replace('/change-master-password')
        })
        bus.$on('copyText', () => {
          this.copyText()
        })
        bus.$on('addNote', () => {
          this.openAddNotePage()
        })
        bus.$on('addNoteFromClipboard', () => {
          this.openAddNoteFromClipboardPage()
        })
        bus.$on('windowMustBeHidden', () => {
          this.$store.commit('setWindowMustBeHidden', true)
        })
        bus.$on('openRecentNote', () => {
          this.openRecentNote()
        })
        bus.$on('openNotifications', () => {
          this.openNotificationsPage()
        })
        bus.$on('openSettings', () => {
          this.openSettingsPage()
        })
        bus.$on('openAbout', () => {
          this.openAboutPage()
        })
        bus.$on('trackUsage', () => {
          this.$store.dispatch('trackUsage')
        })
        this.$refs.search.focus()
        this.$store.dispatch('initDb', () => {
          this.$store.dispatch('loadHistory')
          this.$store.dispatch('loadMiscData')
          if (this.$store.state.Store.appJustStarted) {
            this.searchNotes(this.$store.state.Store.searchQuery)
            this.$store.dispatch('loadReminders')
            this.$store.dispatch('loadNotifications')
            setInterval(() => {
              this.$store.dispatch('checkReminders')
              this.$store.dispatch('checkUsing')
            }, 1000)
            this.$store.dispatch('setAppJustStarted', false)
          }
          this.$store.dispatch('checkNotifications')
        })
      }
      this.$store.dispatch('loadOrCreateSettingsFile', onMounted)
    },
    updated () {
      if (this.$store.state.Store.loadedNotesCount - 1 <= this.$store.state.Store.activeNoteIndex) {
        this.$store.commit('setLoadedNotesCount', this.$store.state.Store.loadedNotesCount + 40)
        this.$store.commit('setLoadedNotesLinksCount', this.$store.state.Store.loadedNotesLinksCount + 40)
        return
      }
      this.$store.dispatch('scrollToActiveNote')
      this.$store.dispatch('highlightNotes')
    },
    methods: {
      scrollNotes (event) {
        if (event.target.scrollTop + event.target.clientHeight === event.target.scrollHeight) {
          if (this.$store.state.Store.loadedNotesCount <= this.notes.length && this.$store.state.Store.loadedNotesLinksCount <= this.notes.length) {
            this.$store.commit('setLoadedNotesCount', this.$store.state.Store.loadedNotesCount + 40)
            this.$store.commit('setLoadedNotesLinksCount', this.$store.state.Store.loadedNotesLinksCount + 40)
          }
        }
      },
      focusOnSearch () {
        this.$refs.search.focus()
      },
      searchNotes (event) {
        this.$store.dispatch('searchNotes', {query: event, cb: () => {}})
      },
      openAddNotePage () {
        this.$store.dispatch('openAddNotePage')
        this.$router.replace('/editor')
      },
      openAddNoteFromClipboardPage () {
        this.$store.dispatch('openAddNoteFromClipboardPage')
        this.$router.replace('/editor')
      },
      openRecentNote () {
        if (!this.$store.state.Store.misc.recentNoteId) return
        this.$store.dispatch('openRecentNote')
        this.$router.replace('/editor')
      },
      openNotificationsPage () {
        this.$router.replace('/notifications')
      },
      setSearchFilter (filter) {
        this.$store.dispatch('setSearchFilter', filter)
      },
      setSearchFilterNotes () {
        this.$store.dispatch('setSearchFilter', 'notes')
      },
      setSearchFilterSecrets () {
        this.$store.dispatch('setSearchFilter', 'secrets')
      },
      setSearchFilterReminder () {
        this.$store.dispatch('setSearchFilter', 'reminder')
      },
      setSearchFilterDeleted () {
        this.$store.dispatch('setSearchFilter', 'deleted')
      },
      setSearchFilterStar () {
        this.$store.dispatch('setSearchFilter', 'star')
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
      },
      copyText () {
        this.$store.dispatch('copyText')
        // this.$store.dispatch('startClipboardCountdown')
        this.$toast('✓ copied')
      },
      historyForward () {
        this.$store.dispatch('historyForward')
      },
      historyBack () {
        this.$store.dispatch('historyBack')
      },
      showQR () {
        this.$store.dispatch('showQR')
        this.$refs.modalQr.show()
      },
      openSettingsPage () {
        this.$router.replace('/settings')
      },
      openAboutPage () {
        this.$router.replace('/about')
      },
      resetSearch () {
        this.$store.dispatch('searchNotes', {query: '', cb: () => {}})
      }
    },
    computed: {
      keymap () {
        return {
          'ctrl+f': this.focusOnSearch,
          'ctrl+down': this.goToNextNote,
          'ctrl+up': this.goToPreviousNote,
          'ctrl+left': this.historyBack,
          'ctrl+right': this.historyForward,
          'ctrl+space': this.openAddNotePage,
          'ctrl+e': this.openRecentNote,
          'ctrl+n': this.openNotificationsPage,
          'ctrl+1': this.setSearchFilterNotes,
          'ctrl+2': this.setSearchFilterSecrets,
          'ctrl+3': this.setSearchFilterStar,
          'ctrl+4': this.setSearchFilterReminder,
          'ctrl+5': this.setSearchFilterDeleted,
          'ctrl+c': this.copyText,
          'ctrl+q': this.showQR,
          'f2': this.openSettingsPage,
          'f3': this.openAboutPage,
          'esc': this.resetSearch
        }
      },
      notes () {
        return this.$store.getters.notes
      },
      loadedNotesLinksCount () {
        return this.$store.state.Store.loadedNotesLinksCount
      },
      loadedNotesCount () {
        return this.$store.state.Store.loadedNotesCount
      },
      searchFilter () {
        return this.$store.getters.searchFilter
      },
      searchQuery () {
        return this.$store.getters.searchQuery
      },
      qr () {
        return this.$store.state.Store.qr
      }
    }
  }
</script>

<style></style>
