<template>
    <b-container fluid class="screen notes" v-hotkey="keymap" v-show="this.$store.state.Store.isLoggedIn">
        <b-modal size="sm" ref="modalQr" id="modal-qr" class="modal-qr" hide-footer title="QR from clipboard">
            <div class="my-4 qr" v-html="qr"></div>
        </b-modal>
        <b-modal size="sm" @shown="modalExportedNotesAutofocus" ref="modalExported" id="modal-exported" class="modal-exported" hide-footer title="Exported notes">
            <b-form-textarea :value="exportedNotes"
                             readonly
                             :rows="6"
                             :max-rows="6">
            </b-form-textarea>
            <div style="text-align: center; margin-top: 10px">
                <b-button-group size="sm">
                    <b-button size="sm" variant="primary" ref="exportedNotesCopyButton" @click="copyExportedNotesAndClose()"><icon name="copy"></icon> Copy and close</b-button>
                </b-button-group>
            </div>
        </b-modal>
        <b-modal size="sm" @shown="modalExportedNotesPasswordAutofocus" ref="modalExportedNotesPassword" hide-footer title="Password for exporting">
            <div class="row justify-content-md-center" style="width: 100%">
                <div class="col-12">
                    <b-form-group label="Password:">
                        <b-form-input type="password"
                                      ref="inputExportedNotesPassword"
                                      @keyup.enter.native="submitExportedNotesPassword()"
                                      @input="inputExportedNotesPassword($event)">
                        </b-form-input>
                    </b-form-group>
                    <b-form-group label="Repeat password:">
                        <div role="group">
                            <b-form-input type="password"
                                          @keyup.enter.native="submitExportedNotesPassword()"
                                          @input="inputExportedNotesRepeatedPassword($event)"
                                          :state="!this.exportedNotesPasswordNotEqual"
                                          aria-describedby="input-exported-notes-password-feeback">
                            </b-form-input>
                            <div class="input-exported-notes-password-feeback" v-if="this.exportedNotesPasswordNotEqual">
                                Not equal
                            </div>
                        </div>
                    </b-form-group>
                    <b-alert show variant="info" v-show="this.exportedNotesPasswordEmpty">
                        The password is empty so database won't be encrypted.
                    </b-alert>
                    <div class="row justify-content-md-center">
                        <b-button type="button" variant="primary" @click="submitExportedNotesPassword()">Let's go</b-button>
                    </div>
                </div>
            </div>
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
                    <b-button-group size="sm">
                        <b-btn :variant="this.$store.state.Store.massSelect ? 'warning' : 'primary' " @click="toggleMassSelect()" title="Mass select (Ctrl+`)"><icon name="check-square-o"></icon></b-btn>
                        <b-dropdown v-if="this.$store.state.Store.massSelect" id="mass-select-dropdown" text="Action" title="Action with selected" size="sm" variant="warning">
                            <b-dropdown-item @click="toggleMassCheck">Select / Un-select all</b-dropdown-item>
                            <b-dropdown-divider></b-dropdown-divider>
                            <b-dropdown-item @click="actionExportEnterPassword()">Export</b-dropdown-item>
                            <b-dropdown-item @click="actionDeleteSelectedNotes()">Delete</b-dropdown-item>
                        </b-dropdown>
                    </b-button-group>
                    <b-button-group size="sm">
                        <b-btn :variant="this.$store.state.Store.dateFilterActive ? 'warning' : 'primary' " @click="toggleDateFilter()" title="Date filter (Ctrl+D)"><icon name="calendar"></icon></b-btn>
                    </b-button-group>
                    <b-button-group size="sm" v-show="searchFilter === 'deleted'">
                        <!--<b-btn variant="success" @click="restoreAllDeletedNotes()">Restore all</b-btn>-->
                        <b-btn variant="danger" @click="emptyTrash()" title="Empty trash"><icon name="trash-o"></icon></b-btn>
                    </b-button-group>
                </div>
                <div class="col-7">
                    <b-input-group size="sm">
                        <b-form-input type="search" class="text-left" placeholder="Search" autofocus @input="searchNotes($event)" ref="search" :value="searchQuery"></b-form-input>
                        <b-button-group size="sm" class="search-filters">
                            <b-button :variant="(searchFilter == 'notes') ? 'warning' : 'secondary'" title="All (Ctrl+1)" @click="setSearchFilter('notes')"><icon name="asterisk"></icon></b-button>
                            <b-button :variant="(searchFilter == 'secrets') ? 'warning' : 'secondary'" title="Secrets (Ctrl+2)" @click="setSearchFilter('secrets')"><icon name="key"></icon></b-button>
                            <b-button :variant="(searchFilter == 'star') ? 'warning' : 'secondary'" title="Favorites (Ctrl+3)" @click="setSearchFilter('star')"><icon name="star"></icon></b-button>
                            <b-button :variant="(searchFilter == 'reminder') ? 'warning' : 'secondary'" title="Reminders (Ctrl+4)" @click="setSearchFilter('reminder')"><icon name="bell"></icon></b-button>
                        </b-button-group>
                        <b-button-group size="sm">
                            <b-btn style="margin-left: 10px;" :variant="(searchFilter == 'deleted') ? 'warning' : 'secondary'" title="Deleted (Ctrl+5)" @click="setSearchFilter('deleted')"><icon name="trash"></icon></b-btn>
                        </b-button-group>
                        <b-button-group size="sm" style="margin-left: 10px">
                            <b-button title="History back (Ctrl+Left)" @click="historyBack()"><icon name="arrow-left"></icon></b-button>
                            <b-button title="History forward (Ctrl+Right)" @click="historyForward()"><icon name="arrow-right"></icon></b-button>
                        </b-button-group>
                    </b-input-group>
                </div>
            </div>
            <div class="date-filter-bar" v-if="this.$store.state.Store.dateFilterActive">
                <b-row>
                    <b-col>
                        <b-form-select
                                @input="inputDateFilterTarget($event)"
                                :value="this.$store.state.Store.dateFilterTarget"
                                :options="[{text: 'created', value: 'created'}, {text: 'updated', value: 'updated'}, {text: 'reminder', value: 'reminder'}]"
                                class="mb-3"
                                size="sm" />
                    </b-col>
                    <b-col>
                        <b-form-select
                                @input="inputDateFilterPrep($event)"
                                :value="this.$store.state.Store.dateFilterPrep"
                                :options="[{text: 'before', value: 'before'}, {text: 'after', value: 'after'}, {text: 'between', value: 'between'}, {text: 'at', value: 'at'}]"
                                class="mb-3"
                                size="sm" />
                    </b-col>
                    <b-col v-if="this.$store.state.Store.dateFilterPrep === 'between'">
                        <b-form-input
                                @input="inputDateFilterDate2($event)"
                                :value="this.$store.state.Store.dateFilterDate2"
                                size="sm"
                                type="date">
                        </b-form-input>
                    </b-col>
                    <b-col>
                        <b-form-input
                                @input="inputDateFilterDate1($event)"
                                :value="this.$store.state.Store.dateFilterDate1"
                                size="sm"
                                type="date">
                        </b-form-input>
                    </b-col>
                    <b-col v-if="this.$store.state.Store.dateFilterPrep !== 'between'"></b-col>
                </b-row>
            </div>
        </div>
        <div class="sidebar" v-if="notes.length" @scroll="scrollNotes($event)">
            <b-button-group vertical class="notes-links" id="notes-links">
                <note-link v-for="(note, index) in notes.slice(0, loadedNotesLinksCount)" :note="note" :key="note._id" :index="index"></note-link>
            </b-button-group>
        </div>
        <!--<div class="banner-empty" v-if="!notes.length">Nothing.</div>-->
        <div class="notes" v-if="notes.length" ref="notes" id="notes" @scroll="scrollNotes($event)">
            <note v-for="(note, index) in notes.slice(0, loadedNotesCount)" :note="note" :key="note._id" :index="index"></note>
        </div>
        <div class="left-status-bar">
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
    data () {
      return {
        exportedNotesPassword: '',
        exportedNotesRepeatedPassword: '',
        exportedNotesPasswordNotEqual: false,
        exportedNotesPasswordEmpty: true
      }
    },
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
        bus.$on('openEditor', () => {
          this.$router.replace('/editor')
        })
        bus.$on('openNotifications', () => {
          this.openNotificationsPage()
        })
        bus.$on('openImport', () => {
          this.openImport()
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
      openImport () {
        this.$router.replace('/import')
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
        this.$store.dispatch('goToNextNote', () => {})
      },
      goToPreviousNote () {
        this.$store.dispatch('goToPreviousNote', () => {})
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
        try {
          this.$store.dispatch('showQR')
          this.$refs.modalQr.show()
        } catch (e) {
          alert('Too much data.')
        }
      },
      openSettingsPage () {
        this.$router.replace('/settings')
      },
      openAboutPage () {
        this.$router.replace('/about')
      },
      resetSearch () {
        this.$refs.search.focus()
        this.$store.dispatch('searchNotes', {query: '', cb: () => {}})
      },
      toggleMassSelect () {
        this.$store.commit('emptySelectedNotes')
        this.$store.commit('toggleMassSelect')
      },
      toggleMassCheck () {
        if (this.$store.state.Store.selectedNotes.length < this.$store.state.Store.notes.length) {
          for (let i = 0; i < this.$store.state.Store.notes.length; i++) {
            this.$store.commit('addNoteToSelected', this.$store.state.Store.notes[i]._id)
          }
        } else {
          this.$store.commit('emptySelectedNotes')
        }
      },
      actionDeleteSelectedNotes () {
        if (!this.$store.state.Store.selectedNotes.length) {
          return false
        }
        if (confirm('Are you sure you want to delete ' + this.$store.state.Store.selectedNotes.length + ' notes?')) {
          for (let i = 0; i < this.$store.state.Store.selectedNotes.length; i++) {
            if (this.$store.state.Store.searchFilter === 'deleted') {
              this.$store.dispatch('actionDeleteNote', this.$store.state.Store.selectedNotes[i])
            } else {
              this.$store.dispatch('actionMarkNoteAsDeleted', this.$store.state.Store.selectedNotes[i])
            }
          }
          this.$store.commit('emptySelectedNotes')
          this.toggleMassSelect()
          this.$toast('✓ deleted')
        }
      },
      actionExportEnterPassword () {
        if (!this.$store.state.Store.selectedNotes.length) {
          return false
        }
        let resultData = []
        for (let i = 0; i < this.$store.state.Store.notes.length; i++) {
          if (this.$store.state.Store.selectedNotes.includes(this.$store.state.Store.notes[i]._id)) {
            let note = this.$store.state.Store.notes[i]
            delete note._id
            note.deleted = false
            note.star = false
            note.reminder = false
            resultData.unshift(note)
          }
        }
        this.$store.commit('setExportedNotes', JSON.stringify(resultData))
        this.$refs.modalExportedNotesPassword.show()
        this.$store.commit('emptySelectedNotes')
        this.toggleMassSelect()
        this.$store.dispatch('searchNotes', {query: this.$store.state.Store.searchQuery})
      },
      openNoteMenu () {
        document.getElementById('note_actions_button_' + this.$store.state.Store.activeNoteIndex).focus()
      },
      copyExportedNotesAndClose () {
        this.$store.dispatch('copyExportedNotes')
        this.$refs.modalExported.hide()
        // this.$store.dispatch('startClipboardCountdown')
        this.$toast('✓ copied')
      },
      exportedNotesPasswordCheck () {
        if (this.exportedNotesPassword !== this.exportedNotesRepeatedPassword) {
          this.exportedNotesPasswordNotEqual = true
        } else {
          this.exportedNotesPasswordNotEqual = false
        }

        if (!this.exportedNotesPassword.length) {
          this.exportedNotesPasswordEmpty = true
        } else {
          this.exportedNotesPasswordEmpty = false
        }
      },
      inputExportedNotesPassword (event) {
        this.exportedNotesPassword = event
        this.exportedNotesPasswordCheck()
      },
      inputExportedNotesRepeatedPassword (event) {
        this.exportedNotesRepeatedPassword = event
        this.exportedNotesPasswordCheck()
      },
      submitExportedNotesPassword () {
        if (this.exportedNotesPasswordNotEqual) {
          return
        }
        this.$store.commit('setExportedNotesPassword', this.exportedNotesPassword)
        this.$store.dispatch('encryptExportedNotesPassword', () => {
          this.$refs.modalExported.show()
        })
      },
      modalExportedNotesPasswordAutofocus () {
        this.$refs.inputExportedNotesPassword.focus()
      },
      modalExportedNotesAutofocus () {
        this.$refs.exportedNotesCopyButton.focus()
      },
      toggleDateFilter () {
        return this.$store.dispatch('toggleDateFilter')
      },
      inputDateFilterTarget (event) {
        return this.$store.commit('setDateFilterTarget', event)
      },
      inputDateFilterPrep (event) {
        return this.$store.commit('setDateFilterPrep', event)
      },
      inputDateFilterDate1 (event) {
        return this.$store.commit('setDateFilterDate1', event)
      },
      inputDateFilterDate2 (event) {
        return this.$store.commit('setDateFilterDate2', event)
      }
    },
    computed: {
      keymap () {
        return {
          'ctrl+`': this.toggleMassSelect,
          'ctrl+d': this.toggleDateFilter,
          'ctrl+f': this.focusOnSearch,
          'ctrl+down': this.goToNextNote,
          'ctrl+up': this.goToPreviousNote,
          'ctrl+left': this.historyBack,
          'ctrl+right': this.historyForward,
          'ctrl+space': this.openAddNotePage,
          'ctrl+e': this.openRecentNote,
          'ctrl+enter': this.openNoteMenu,
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
      },
      exportedNotes () {
        return this.$store.state.Store.exportedNotes
      }
    }
  }
</script>

<style></style>
