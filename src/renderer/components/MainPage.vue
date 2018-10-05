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
                        <b-button type="button" variant="primary" @click="submitExportedNotesPassword()">Ok</b-button>
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
                        <b-btn variant="primary" @click="openRecentNote()" title="Open recent note (Ctrl+E)"><icon name="pen"></icon></b-btn>
                    </b-button-group>
                    <b-button-group size="sm">
                        <b-btn variant="primary" @click="showQR()" title="QR from clipboard (Ctrl+Q)"><icon name="qrcode"></icon></b-btn>
                    </b-button-group>
                    <b-button-group size="sm">
                        <b-btn variant="primary" :variant="this.$store.state.Store.notificationsIsUnread ? 'danger' : 'primary' " @click="openNotificationsPage()" title="Notifications (Ctrl+N)"><icon name="bell"></icon></b-btn>
                    </b-button-group>
                    <b-button-group size="sm">
                        <b-btn :variant="this.$store.state.Store.massSelect ? 'warning' : 'primary' " @click="toggleMassSelect()" title="Mass select (Ctrl+M)"><icon name="check-square"></icon></b-btn>
                        <b-dropdown v-if="this.$store.state.Store.massSelect" title="Action with selected (Ctrl+Shift+M)" size="sm" variant="warning" ref="massSelectDropdown">
                            <b-dropdown-item @click="toggleMassCheck">Select / Un-select all (Ctrl+Shift+.)</b-dropdown-item>
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
                        <b-btn variant="danger" @click="emptyTrash()" title="Empty trash"><icon name="trash-alt"></icon></b-btn>
                    </b-button-group>
                </div>
                <div class="col-7">
                    <b-input-group size="sm">
                        <b-button-group size="sm" style="margin-left: 4px" v-if="this.$store.state.Store.marksCount">
                            <b-button title="Next match (Ctrl+Shift+Right)" @click="goToNextMark()"><icon name="caret-square-down"></icon></b-button>
                            <b-button title="Previous match (Ctrl+Shift+Left)" @click="goToPreviousMark()"><icon name="caret-square-up"></icon></b-button>
                        </b-button-group>
                        <b-form-input type="search" class="text-left" placeholder="Search" autofocus @input="searchNotes($event)" @keydown.native="searchKeydown($event)" ref="search" :value="searchQuery"></b-form-input>
                        <b-button-group size="sm" class="search-filters">
                            <b-button :variant="(searchFilter == 'notes') ? 'warning' : 'secondary'" title="All (Ctrl+1)" @click="setSearchFilter('notes')"><icon name="asterisk"></icon></b-button>
                            <b-button :variant="(searchFilter == 'secrets') ? 'warning' : 'secondary'" title="Secrets (Ctrl+2)" @click="setSearchFilter('secrets')"><icon name="key"></icon></b-button>
                            <b-button :variant="(searchFilter == 'star') ? 'warning' : 'secondary'" title="Favorites (Ctrl+3)" @click="setSearchFilter('star')"><icon name="star"></icon></b-button>
                            <b-button :variant="(searchFilter == 'reminder') ? 'warning' : 'secondary'" title="Reminders (Ctrl+4)" @click="setSearchFilter('reminder')"><icon name="bell"></icon></b-button>
                        </b-button-group>
                        <b-button-group size="sm">
                            <b-btn style="margin-left: 4px;" :variant="(searchFilter == 'deleted') ? 'warning' : 'secondary'" title="Trash (Ctrl+5)" @click="setSearchFilter('deleted')"><icon name="trash"></icon></b-btn>
                        </b-button-group>
                        <b-button-group size="sm" style="margin-left: 4px">
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
                                @keydown.native="dateFilterKeydown($event)"
                                :value="this.$store.state.Store.dateFilterTarget"
                                :options="[{text: 'created', value: 'created'}, {text: 'updated', value: 'updated'}, {text: 'reminder', value: 'reminder'}]"
                                class="mb-3"
                                size="sm" />
                    </b-col>
                    <b-col>
                        <b-form-select
                                @input="inputDateFilterPrep($event)"
                                @keydown.native="dateFilterKeydown($event)"
                                :value="this.$store.state.Store.dateFilterPrep"
                                :options="[{text: 'at', value: 'at'}, {text: 'between', value: 'between'}]"
                                class="mb-3"
                                size="sm" />
                    </b-col>
                    <b-col v-if="this.$store.state.Store.dateFilterPrep === 'between'">
                        <b-form-input
                                ref="dateFilterDate2"
                                @input="inputDateFilterDate2($event)"
                                @keydown.native="dateFilterKeydown($event)"
                                :value="this.$store.state.Store.dateFilterDate2"
                                size="sm"
                                type="date">
                        </b-form-input>
                    </b-col>
                    <b-col>
                        <b-form-input
                                ref="dateFilterDate1"
                                @keydown.native.ctrl.prevent
                                @input="inputDateFilterDate1($event)"
                                @keydown.native="dateFilterKeydown($event)"
                                :value="this.$store.state.Store.dateFilterDate1"
                                size="sm"
                                type="date">
                        </b-form-input>
                    </b-col>
                    <b-col v-if="this.$store.state.Store.dateFilterPrep !== 'between'"></b-col>
                </b-row>
            </div>
            <cmd-hash v-if="searchCmd === '/hash'"></cmd-hash>
            <cmd-tz v-if="searchCmd === '/tz'"></cmd-tz>
        </div>
        <div class="sidebar" v-if="notes.length">
            <b-button-group vertical class="notes-links" id="notes-links">
                <note-link v-for="(note, index) in pageNotes" :note="note" :key="note._id" :index="index"></note-link>
            </b-button-group>
            <pagination v-if="pagerPagesCount > 1"></pagination>
        </div>
        <!--<div class="banner-empty" v-if="!notes.length">Nothing.</div>-->
        <div class="notes" v-if="notes.length" ref="notes" id="notes">
            <note v-for="(note, index) in pageNotes" :note="note" :key="note._id" :index="index"></note>
        </div>
        <div class="left-status-bar">
            Found: {{ notes.length }}
        </div>
        <div class="bottom-nav-bar">
            <!--<b-button-group size="sm" style="margin-left: 4px" v-if="this.$store.state.Store.notes.length">-->
                <!--<b-button title="Next note (Ctrl+Right)" @click="goToNextNote()"><icon name="arrow-down"></icon></b-button>-->
                <!--<b-button title="Previous note (Ctrl+Left)" @click="goToPreviousNote()"><icon name="arrow-up"></icon></b-button>-->
            <!--</b-button-group>-->
        </div>
    </b-container>
</template>

<script>
  import bus from '../bus'
  import Icon from '../../../node_modules/vue-awesome/components/Icon.vue'
  import Note from '../components/MainPage/Note.vue'
  import NoteLink from '../components/MainPage/NoteLink.vue'
  import Pagination from '../components/MainPage/Pagination.vue'
  import CmdHash from '../components/MainPage/CmdHash.vue'
  import CmdTz from '../components/MainPage/CmdTz.vue'

  const fs = require('fs')
  const {ipcRenderer} = require('electron')

  export default {
    name: 'main-page',
    components: { Icon, Note, NoteLink, Pagination, CmdHash, CmdTz },
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
        if (this.$store.state.Store.needReload) {
          ipcRenderer.send('logout')
        }
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
      this.$store.dispatch('scrollToActiveNote')
      this.$store.dispatch('scrollToActiveNoteLink')
      this.$store.dispatch('highlightNotes')
    },
    updated () {
      if (this.$store.state.Store.needFocusOn === 'dateFilterDate1') {
        this.$refs.dateFilterDate1.focus()
        this.$store.commit('setNeedFocusOn', null)
      }
      if (this.$store.state.Store.needScroll) {
        this.$store.dispatch('scrollToActiveNote')
        this.$store.dispatch('scrollToActiveNoteLink')
        this.$store.commit('setNeedScroll', false)
      }
      this.$store.dispatch('highlightNotes')
      this.$store.dispatch('checkSearchCmd')
    },
    methods: {
      focusOnSearch () {
        this.$refs.search.focus()
      },
      searchNotes (event) {
        if (this.$store.state.Store.preventSearch) {
          this.$store.commit('setPreventSearch', false)
          return false
        }
        this.$store.dispatch('searchNotes', {
          query: event,
          cb: () => {
            this.$store.dispatch('scrollToActiveNote')
            this.$store.dispatch('scrollToActiveNoteLink')
          }
        })
      },
      searchKeydown (event) {
        this.$store.commit('setHistoryTransition', false)
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
        this.$store.dispatch('goToNextNote', () => {
          this.$store.dispatch('scrollToActiveNote')
          this.$store.dispatch('scrollToActiveNoteLink')
          this.$store.dispatch('defineFirstMark')
        })
      },
      goToPreviousNote () {
        this.$store.dispatch('goToPreviousNote', () => {
          this.$store.dispatch('scrollToActiveNote')
          this.$store.dispatch('scrollToActiveNoteLink')
          this.$store.dispatch('defineFirstMark')
        })
      },
      goToNextMark () {
        this.$store.dispatch('goToNextMark')
      },
      goToPreviousMark () {
        this.$store.dispatch('goToPreviousMark')
      },
      historyForward () {
        this.$store.dispatch('historyForward', () => {
          this.$store.commit('setNeedScroll', true)
          // this.$store.dispatch('scrollToActiveNoteLink')
          this.$store.dispatch('defineFirstMark')
          this.$store.commit('setHistoryTransition', false)
          this.$store.commit('setPreventSearch', false)
        })
      },
      historyBack () {
        this.$store.dispatch('historyBack', () => {
          this.$store.commit('setNeedScroll', true)
          // this.$store.dispatch('scrollToActiveNoteLink')
          this.$store.dispatch('defineFirstMark')
          this.$store.commit('setHistoryTransition', false)
          this.$store.commit('setPreventSearch', false)
        })
      },
      copyText () {
        this.$store.dispatch('copyText')
        // this.$store.dispatch('startClipboardCountdown')
        this.$toast('✓ copied')
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
        this.$store.commit('setSearchQuery', '')
        this.$store.commit('setDateFilterActive', false)
        this.$store.dispatch(
          'setSearchFilter',
          'notes',
          () => {
            this.$store.dispatch('scrollToActiveNote')
            this.$store.dispatch('scrollToActiveNoteLink')
          })
        this.$store.commit('setNeedScroll', true)
      },
      toggleMassSelect () {
        this.$store.commit('emptySelectedNotes')
        this.$store.commit('toggleMassSelect')
      },
      clickMassSelectDropdown () {
        if (this.$store.state.Store.massSelect) {
          this.$refs.massSelectDropdown.show()
        }
      },
      selectActiveNote () {
        if (this.$store.state.Store.massSelect) {
          this.$store.dispatch('selectNote', {
            'id': this.$store.state.Store.activeNoteId,
            'value': !this.$store.state.Store.selectedNotes.includes(this.$store.state.Store.activeNoteId)
          })
        }
      },
      selectAllNotes () {
        this.toggleMassCheck()
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
            let note = JSON.parse(JSON.stringify(this.$store.state.Store.notes[i]))
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
      focusOnNoteMenu () {
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
        if (!this.$store.state.Store.dateFilterActive) {
          this.$store.commit('setNeedFocusOn', 'dateFilterDate1')
        } else {
          this.$refs.search.focus()
        }
        this.$store.commit('toggleDateFilter')
        this.$store.dispatch('searchNotes', {query: this.$store.state.Store.searchQuery})
      },
      dateFilterKeydown (event) {
        if (event.code === 'KeyU') {
          this.$store.commit('setDateFilterTarget', 'updated')
        } else if (event.code === 'KeyC') {
          this.$store.commit('setDateFilterTarget', 'created')
        } else if (event.code === 'KeyR') {
          this.$store.commit('setDateFilterTarget', 'reminder')
        } else if (event.code === 'KeyA') {
          this.$store.commit('setDateFilterPrep', 'at')
        } else if (event.code === 'KeyB') {
          this.$store.commit('setDateFilterPrep', 'between')
        }
      },
      inputDateFilterTarget (event) {
        this.$store.commit('setDateFilterTarget', event)
        this.$store.dispatch('searchNotes', {query: this.$store.state.Store.searchQuery})
      },
      inputDateFilterPrep (event) {
        this.$store.commit('setDateFilterPrep', event)
        this.$store.dispatch('searchNotes', {query: this.$store.state.Store.searchQuery})
      },
      inputDateFilterDate1 (event) {
        this.$store.commit('setDateFilterDate1', event)
        this.$store.dispatch('searchNotes', {query: this.$store.state.Store.searchQuery})
      },
      inputDateFilterDate2 (event) {
        this.$store.commit('setDateFilterDate2', event)
        this.$store.dispatch('searchNotes', {query: this.$store.state.Store.searchQuery})
      },
      goToFirstPage () {
        if (!this.$store.state.Store.pagerPagesCount) {
          return false
        }
        this.$store.commit('setPagerPage', 1)
        this.$store.commit('setActiveNoteIndex', 0)
        this.$store.dispatch('scrollToActiveNote')
        this.$store.dispatch('scrollToActiveNoteLink')
      },
      goToPreviousPage () {
        if (!this.$store.state.Store.pagerPagesCount) {
          return false
        }
        if (this.$store.state.Store.pagerPage === 1) {
          this.$store.commit('setPagerPage', this.$store.state.Store.pagerPagesCount)
        } else {
          this.$store.commit('setPagerPage', this.$store.state.Store.pagerPage - 1)
        }
        this.$store.commit('setActiveNoteIndex', 0)
        this.$store.dispatch('scrollToActiveNote')
        this.$store.dispatch('scrollToActiveNoteLink')
      },
      goToLastPage () {
        if (!this.$store.state.Store.pagerPagesCount) {
          return false
        }
        this.$store.commit('setPagerPage', this.$store.state.Store.pagerPagesCount)
        this.$store.commit('setActiveNoteIndex', 0)
        this.$store.dispatch('scrollToActiveNote')
        this.$store.dispatch('scrollToActiveNoteLink')
      },
      goToNextPage () {
        if (!this.$store.state.Store.pagerPagesCount) {
          return false
        }
        if (this.$store.state.Store.pagerPage === this.$store.state.Store.pagerPagesCount) {
          this.$store.commit('setPagerPage', 1)
        } else {
          this.$store.commit('setPagerPage', this.$store.state.Store.pagerPage + 1)
        }
        this.$store.commit('setActiveNoteIndex', 0)
        this.$store.dispatch('scrollToActiveNote')
        this.$store.dispatch('scrollToActiveNoteLink')
      }
    },
    computed: {
      keymap () {
        return {
          'ctrl+shift+m': this.clickMassSelectDropdown,
          'ctrl+m': this.toggleMassSelect,
          'ctrl+.': this.selectActiveNote,
          'ctrl+shift+.': this.selectAllNotes,
          'ctrl+d': this.toggleDateFilter,
          'ctrl+f': this.focusOnSearch,
          'ctrl+down': this.goToNextNote,
          'ctrl+up': this.goToPreviousNote,
          'ctrl+shift+down': this.goToNextMark,
          'ctrl+shift+up': this.goToPreviousMark,
          'ctrl+left': this.historyBack,
          'ctrl+right': this.historyForward,
          'ctrl+space': this.openAddNotePage,
          'ctrl+e': this.openRecentNote,
          'ctrl+enter': this.focusOnNoteMenu,
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
          'esc': this.resetSearch,
          'ctrl+shift+[': this.goToFirstPage,
          'ctrl+[': this.goToPreviousPage,
          'ctrl+shift+]': this.goToLastPage,
          'ctrl+]': this.goToNextPage
        }
      },
      pagerPage () {
        return this.$store.state.Store.pagerPage
      },
      pagerPagesCount () {
        return this.$store.state.Store.pagerPagesCount
      },
      pageNotes () {
        let notes = this.$store.state.Store.notes.slice(
          (this.$store.state.Store.pagerPage - 1) * this.$store.state.Store.pagerNotesPerPage,
          (this.$store.state.Store.pagerPage - 1) * this.$store.state.Store.pagerNotesPerPage + this.$store.state.Store.pagerNotesPerPage
        )
        this.$store.commit('setPagerCurrentPageCount', notes.length)
        return notes
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
      },
      searchCmd () {
        return this.$store.state.Store.searchCmd
      }
    }
  }
</script>

<style></style>
