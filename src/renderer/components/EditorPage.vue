<template>
    <b-form>
        <b-container fluid class="screen editor" v-hotkey="keymap">
            <div class="topbar">
                <div class="row" align-h="between">
                    <div class="col-6">
                        <h4 v-if="editorMode === 'add'">Add note</h4>
                        <h4 v-else>Edit note <span class="deleted-badge" pill v-if="note.deleted">deleted</span></h4>
                    </div>
                    <div class="col-6" style="text-align: right">
                        <b-button title="Quick save (Ctrl+Shift+S)" size="sm" type="button" variant="warning" v-show="this.$store.state.Store.noteIsModified" @click="editorSave()"><icon name="save"></icon></b-button>
                        <b-button title="Ctrl+S" size="sm" type="button" variant="success" @click="editorSaveAndClose()"><icon name="save"></icon> Save & close</b-button>
                        <b-button-group size="sm">
                            <b-btn variant="primary" @click="close()" title="Close (Esc)"><icon name="times"></icon></b-btn>
                        </b-button-group>
                    </div>
                </div>
            </div>
            <div class="content-wrap" @input="modify()">
                <b-tabs card small no-fade v-model="tab" @input="tabChange($event)">
                    <b-tab title="Editor" active>
                        <b-form-group id="exampleInputGroup1" label-for="titleInput">
                            <b-form-input id="titleInput" type="text" class="title" placeholder="Title" @input="editorChangeTitle($event)" :value="noteTitle"></b-form-input>
                        </b-form-group>
                        <b-form-group id="exampleInputGroup2" label-for="contentTextArea">
                            <b-form-textarea id="contentTextArea"
                                             ref="content"
                                             class="content"
                                             placeholder="Content"
                                             :rows="16" autofocus @input="editorChangeContent($event)"  :value="noteContent"
                            ></b-form-textarea>
                        </b-form-group>
                        <b-button-group size="sm" class="mx-1">
                            <b-form-checkbox value="true" :checked="noteHidden" @change="editorToggleHideContent()">Hide the content (Ctrl+H)</b-form-checkbox>
                        </b-button-group>
                    </b-tab>
                    <b-tab title="Secrets">
                        <div class="secrets">
                            <editor-secret v-for="(secret, index) in noteSecrets" :key="index" :index="index" :secret="secret"></editor-secret>
                        </div>
                        <b-button ref="editorNoteAddSecret" size="sm" style="margin-top: 10px;" @click="editorAddSecret()"><icon name="plus"></icon> Add</b-button>
                    </b-tab>
                    <b-tab title="Reminder">
                        <b-alert show variant="warning">Remember that you're won't getting reminders when you're not logged in.</b-alert>
                        <b-button-toolbar aria-label="Toolbar with button groups and input groups">
                            <b-button-group size="sm" class="mx-1">
                                <b-form-checkbox ref="editorNoteReminder" value="true" :checked="noteReminder" @change="editorToggleReminder()">Enabled </b-form-checkbox>
                            </b-button-group>
                            <span v-show="noteReminder">
                                <b-button-toolbar>
                            <div v-if="noteReminder" class="reminder-links">
                                <br>
                                <b-button size="sm" @click="btnIn10Minutes()">In 10 minutes</b-button>
                                <b-button size="sm" @click="btnIn30Minutes()">In 30 minutes</b-button>
                                <b-button size="sm" @click="btnIn1Hour()">In 1 hour</b-button>
                                <b-button size="sm" @click="btnToday()">Today</b-button>
                                <b-button size="sm" @click="btnTomorrow()">Tomorrow</b-button>
                                <b-button size="sm" @click="btnNextWeek()">Next week</b-button>
                                <b-button size="sm" @click="btnNextMonth()">Next month</b-button>
                                <b-button size="sm" @click="btnNextYear()">Next year</b-button>
                            </div>
                        </b-button-toolbar>
                            <b-button-group size="sm" class="mx-1">
                                <b-form-input size="sm" type="date" :value="noteReminderDate" @change="editorChangeReminderDate($event)"></b-form-input>
                            </b-button-group>
                            <b-button-group size="sm" class="mx-1"> at </b-button-group>
                            <b-button-group size="sm" class="mx-1">
                                <b-form-input size="sm" type="time" :value="noteReminderTime" @change="editorChangeReminderTime($event)"></b-form-input>
                            </b-button-group>
                            <b-button-group size="sm" class="mx-1"> and repeat </b-button-group>
                            <b-button-group size="sm" class="mx-1">
                                <b-form-select :value="noteReminderRepeat" @input="editorChangeReminderRepeat($event)">
                                    <option value="0">never</option>
                                    <option value="10">every minute</option>
                                    <option value="20">every hour</option>
                                    <option value="30">every day</option>
                                    <option value="40">every week</option>
                                    <option value="50">every month</option>
                                    <option value="60">every year</option>
                                </b-form-select>
                            </b-button-group>
                            </span>
                        </b-button-toolbar>
                        <b-button-group size="sm" class="mx-1">
                            <b-form-checkbox id="checkbox2" value="true" v-show="noteReminder" :checked="noteReminderRemoveNote" @change="editorToggleReminderRemoveNote()">Remove note after reminder</b-form-checkbox>
                        </b-button-group>
                    </b-tab>
                </b-tabs>
            </div>
        </b-container>
    </b-form>
</template>

<script>
  import EditorSecret from '../components/MainPage/EditorSecret.vue'
  import moment from 'moment'
  import Icon from '../../../node_modules/vue-awesome/components/Icon.vue'

  export default {
    name: 'editor-page',
    components: {
      Icon,
      EditorSecret },
    data () {
      return {
        tab: 0
      }
    },
    computed: {
      editorMode () {
        return this.$store.state.Store.editorMode
      },
      note () {
        return this.$store.state.Store.note
      },
      noteIsModified () {
        return this.$store.state.Store.noteIsModified
      },
      noteTitle () {
        return this.$store.state.Store.note.title
      },
      noteContent () {
        return this.$store.state.Store.note.content
      },
      noteSecrets () {
        return this.$store.state.Store.note.secrets
      },
      noteReminder () {
        return this.$store.state.Store.note.reminder
      },
      noteHidden () {
        return this.$store.state.Store.note.hidden
      },
      noteReminderRemoveNote () {
        return this.$store.state.Store.note.reminderRemoveNote
      },
      noteReminderDate () {
        return moment(this.$store.state.Store.note.reminderDate).format('YYYY-MM-DD')
      },
      noteReminderTime () {
        return this.$store.state.Store.note.reminderTime
      },
      noteReminderRepeat () {
        return this.$store.state.Store.note.reminderRepeat
      },
      keymap () {
        return {
          'esc': this.close,
          'ctrl+s': this.editorSaveAndClose,
          'ctrl+shift+s': this.editorSave,
          'ctrl+left': this.historyBack,
          'ctrl+right': this.historyForward,
          'ctrl+up': this.prevNoteEditor,
          'ctrl+down': this.nextNoteEditor,
          'ctrl+1': this.setTab0,
          'ctrl+2': this.setTab1,
          'ctrl+3': this.setTab2,
          'ctrl+c': this.copyText,
          'ctrl+p': this.pastePassword,
          'ctrl+t': this.pasteDate,
          'ctrl+-': this.pasteLine,
          'ctrl+=': this.pasteDoubleLine,
          'ctrl+d': this.repeatLine,
          'ctrl+h': this.editorToggleHideContent
        }
      }
    },
    mounted () {
      if (this.$store.state.Store.appJustStarted) {
        this.$router.replace('/')
      }
      this.$refs.content.focus()
      this.$store.dispatch('setNoteIsModified', false)
      this.tab = this.$store.state.Store.editorInitTab
    },
    updated () {
      if (this.$store.state.Store.needFocusOn === 'editorNoteReminder') {
        this.$store.commit('setNeedFocusOn', null)
        this.$refs.editorNoteReminder.$el.getElementsByTagName('input')[0].focus()
      } else if (this.$store.state.Store.needFocusOn === 'editorNoteAddSecret') {
        this.$store.commit('setNeedFocusOn', null)
        this.$refs.editorNoteAddSecret.focus()
      } else if (this.$store.state.Store.needFocusOn === 'content') {
        this.$store.commit('setNeedFocusOn', null)
        this.$refs.content.focus()
      }
    },
    methods: {
      setTab0 () { this.tab = 0 },
      setTab1 () { this.tab = 1 },
      setTab2 () { this.tab = 2 },
      tabChange ($event) {
        if (this.tab === 1) {
          this.$store.commit('setNeedFocusOn', 'editorNoteAddSecret')
        } else if (this.tab === 2) {
          this.$store.commit('setNeedFocusOn', 'editorNoteReminder')
        } else if (this.tab === 0) {
          this.$store.commit('setNeedFocusOn', 'content')
        }
      },
      modify () {
        this.$store.dispatch('setNoteIsModified', true)
      },
      close () {
        this.$store.commit('setWindowMustBeHidden', false)
        this.$router.replace('/')
      },
      editorChangeTitle (event) {
        this.$store.dispatch('editorChangeTitle', event)
      },
      editorChangeContent (event) {
        this.$store.dispatch('editorChangeContent', event)
      },
      editorSave () {
        if (this.$store.state.Store.editorMode === 'add') {
          return
        }
        let id = this.$store.state.Store.note._id
        this.$store.dispatch('editorSaveAndClose', () => {
          this.$store.dispatch('openEditNotePage', id)
          this.$store.dispatch('setNoteIsModified', false)
        })
      },
      editorSaveAndClose () {
        this.$store.dispatch('editorSaveAndClose', () => {
          this.$store.dispatch('setNoteIsModified', false)
          this.$router.replace('/')
        })
      },
      editorAddSecret () {
        this.$store.dispatch('editorAddSecret')
        this.modify()
      },
      editorToggleReminder () {
        this.$store.dispatch('editorToggleReminder')
        this.modify()
      },
      editorToggleHideContent () {
        this.$store.dispatch('editorToggleHideContent')
        this.modify()
      },
      editorToggleReminderRemoveNote () {
        this.$store.dispatch('editorToggleReminderRemoveNote')
        this.modify()
      },
      editorChangeReminderDate (event) {
        this.$store.dispatch('editorChangeReminderDate', event)
      },
      editorChangeReminderTime (event) {
        this.$store.dispatch('editorChangeReminderTime', event)
      },
      editorChangeReminderRepeat (event) {
        this.$store.dispatch('editorChangeReminderRepeat', event)
      },
      historyForward () {
        if (this.$store.state.Store.noteIsModified) {
          return
        }
        this.$store.dispatch('historyForwardEditor')
      },
      historyBack () {
        if (this.$store.state.Store.noteIsModified) {
          return
        }
        this.$store.dispatch('historyBackEditor')
      },
      nextNoteEditor () {
        if (this.$store.state.Store.noteIsModified) {
          return
        }
        this.$store.dispatch('nextNoteEditor')
      },
      prevNoteEditor () {
        if (this.$store.state.Store.noteIsModified) {
          return
        }
        this.$store.dispatch('prevNoteEditor')
      },
      copyText () {
        this.$store.dispatch('copyText')
        // this.$store.dispatch('startClipboardCountdown')
      },
      pastePassword () {
        this.$store.dispatch('editorPastePassword')
      },
      pasteDate () {
        this.$store.dispatch('editorPasteCurrentDateTime')
      },
      pasteLine () {
        this.$store.dispatch('editorPasteLine')
      },
      pasteDoubleLine () {
        this.$store.dispatch('editorPasteDoubleLine')
      },
      repeatLine () {
        this.$store.dispatch('editorRepeatLine')
      },
      btnIn10Minutes () {
        let newDate = moment().add(10, 'minutes')
        this.$store.commit('setNoteReminderDate', newDate.valueOf())
        this.$store.commit('setNoteReminderTime', newDate.format('HH:mm'))
      },
      btnIn30Minutes () {
        let newDate = moment().add(30, 'minutes')
        this.$store.commit('setNoteReminderDate', newDate.valueOf())
        this.$store.commit('setNoteReminderTime', newDate.format('HH:mm'))
      },
      btnIn1Hour () {
        let newDate = moment().add(1, 'hour')
        this.$store.commit('setNoteReminderDate', newDate.valueOf())
        this.$store.commit('setNoteReminderTime', newDate.format('HH:mm'))
      },
      btnToday () {
        let newDate = moment()
        this.$store.commit('setNoteReminderDate', newDate.valueOf())
        this.$store.commit('setNoteReminderTime', newDate.format('HH:mm'))
      },
      btnTomorrow () {
        let newDate = moment().add(1, 'day')
        this.$store.commit('setNoteReminderDate', newDate.valueOf())
        this.$store.commit('setNoteReminderTime', newDate.format('HH:mm'))
      },
      btnNextWeek () {
        let newDate = moment().add(1, 'week')
        this.$store.commit('setNoteReminderDate', newDate.valueOf())
        this.$store.commit('setNoteReminderTime', newDate.format('HH:mm'))
      },
      btnNextMonth () {
        let newDate = moment().add(1, 'month')
        this.$store.commit('setNoteReminderDate', newDate.valueOf())
        this.$store.commit('setNoteReminderTime', newDate.format('HH:mm'))
      },
      btnNextYear () {
        let newDate = moment().add(1, 'year')
        this.$store.commit('setNoteReminderDate', newDate.valueOf())
        this.$store.commit('setNoteReminderTime', newDate.format('HH:mm'))
      }
    },
    beforeRouteLeave (to, from, next) {
      if (this.$store.state.Store.noteIsModified) {
        if (confirm('Save changes?')) {
          this.editorSave()
        }
      }
      this.$store.commit('setNoteIsModified', false)
      this.$store.commit('setEditorInitTab', 0)
      next()
    }
  }
</script>

<style></style>
