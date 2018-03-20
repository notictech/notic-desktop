<template>
    <div :id="'note_index_' + index" :class="{note: true, active: activeNoteIndex == index}" @mouseup.middle="openEditNotePage(note._id, index)" @contextmenu="showNoteContextMenu(note._id, index)" @click="clickNote(note._id, index)">
        <h5>
            <b-button size="sm" variant="success" v-if="searchFilter === 'deleted'" @click="restoreNote(note._id)">Restore</b-button>
            <b-button title="Mark as favorite" size="sm" v-if="!note.deleted" :variant="note.star ? 'warning' : ''" @click="toggleStar(note._id, index)"><icon name="star"></icon></b-button>
            <!--<b-button title="Edit" size="sm" @click="openEditNotePage(note._id)"><icon name="pencil"></icon></b-button>-->
            <!--<b-button title="Delete" size="sm" @click="actionDeleteNote(note._id, searchFilter === 'deleted')"><icon name="trash"></icon></b-button>-->
            <!--<b-dropdown class="m-md-2" size="sm">-->
            <!--<b-dropdown-item @click="openEditNotePage(note._id)"><icon name="pencil"></icon> Edit</b-dropdown-item>-->
            <!--<b-dropdown-item @click="cloneNote(note._id)"><icon name="files-o"></icon> Clone</b-dropdown-item>-->
            <!--<b-dropdown-item @click="actionDeleteNote(note._id, searchFilter === 'deleted')"><icon name="trash"></icon> Delete</b-dropdown-item>-->
            <!--</b-dropdown>-->
            <b-button size="sm" :id="'note_actions_button_' + index" @click="showNoteContextMenu(note._id, index)" @keydown="activeNoteActionsKeydown($event)" title="Actions" class="note-actions-button"><icon name="magic"></icon></b-button>
        </h5>
        <h1><b-form-checkbox v-if="this.$store.state.Store.massSelect" plain class="note-link-checkbox" :id="'notelink_checkbox_' + index" :checked="this.$store.state.Store.selectedNotes.includes(note._id)" @change="selectNote(note._id, $event)">
        </b-form-checkbox>{{ note.title }}</h1>
        <h2>{{ formattedNoteDate }}
            <b-button title="Reminders" class="note-reminder-btn" size="sm" :variant="(note.reminder) ? 'outline-danger' : 'outline-secondary'" @click="setEditorInitTab(note._id, index)"><icon name="bell"></icon></b-button><span v-show="note.reminder">{{ formattedReminderInfo }}</span>
        </h2>
        <h3 v-show="note.secrets.length">
            <b-button size="sm" variant="info" v-for="(secret, index) in note.secrets" :key="index" @click="copySecret(secret.content)" title="Click to copy"><icon name="key"></icon> {{secret.title}}</b-button>
        </h3>
        <h4 v-if="!contentIsHidden" :id="'note_content_' + index" :contenteditable="this.$store.state.Store.activeNoteId === note._id" oncut="return false" onpaste="return false" onkeydown="return preventContentChanging(event)">{{ note.content }}</h4>
        <b-button variant="outline-primary" :id="'show_content_' + index" size="sm" class="content-is-hidden" v-if="contentIsHidden" @click="contentIsHidden = !contentIsHidden"><icon name="eye"></icon> Show the content</b-button>
    </div>
</template>

<script>
  import Icon from '../../../../node_modules/vue-awesome/components/Icon.vue'
  import moment from 'moment'
  const {clipboard} = require('electron')
  export default {
    components: {Icon},
    props: ['note', 'index'],
    data () {
      return {
        contentIsHidden: this.note.hidden
      }
    },
    computed: {
      activeNoteIndex () {
        return this.$store.state.Store.activeNoteIndex
      },
      searchFilter () {
        return this.$store.getters.searchFilter
      },
      formattedReminderInfo () {
        let date = moment(this.note.reminderDate).format('DD.MM.YYYY')
        let time = this.note.reminderTime
        let repeat = this.note.reminderRepeat
        switch (parseInt(this.note.reminderRepeat)) {
          case 0:
            repeat = ''
            break
          case 10:
            repeat = 'and every minute'
            break
          case 20:
            repeat = 'and every hour'
            break
          case 30:
            repeat = 'and every day'
            break
          case 40:
            repeat = 'and every week'
            break
          case 50:
            repeat = 'and every month'
            break
          case 60:
            repeat = 'and every year'
            break
        }

        return `${date} at ${time} ${repeat}`
      },
      formattedNoteDate () {
        let createdAt = moment(this.note.createdAt).format('DD.MM.YYYY HH:mm')
        let updatedAt = moment(this.note.updatedAt).format('DD.MM.YYYY HH:mm')
        return (this.note.createdAt === this.note.updatedAt) ? `${createdAt}` : `${createdAt}, upd: ${updatedAt}`
      }
    },
    methods: {
      copySecret (text) {
        clipboard.writeText(text)
        this.$store.dispatch('startClipboardCountdown')
        this.$toast('✓ copied')
      },
      actionDeleteNote (id, deleted = false) {
        if (confirm('Are you sure you want to delete this note?')) {
          if (deleted) {
            this.$store.dispatch('actionDeleteNote', id)
          } else {
            this.$store.dispatch('actionMarkNoteAsDeleted', id)
          }
        }
      },
      openEditNotePage (id, index) {
        this.$store.commit('setActiveNoteIndex', index)
        this.$store.commit('setActiveNoteId', id)
        this.$store.dispatch('addNoteToHistory', id)
        this.$store.dispatch('openEditNotePage', id)
        this.$router.replace('/editor')
      },
      cloneNote (id) {
        this.$store.dispatch('cloneNote', id)
      },
      restoreNote (id) {
        if (confirm('Are you sure you want to restore this note?')) {
          this.$store.dispatch('restoreDeletedNote', id)
        }
      },
      showNoteContextMenu (id, index) {
        this.$store.commit('setActiveNoteIndex', index)
        this.$store.commit('setActiveNoteId', id)
        this.$store.dispatch('addNoteToHistory', id)
        this.$store.dispatch('showNoteContextMenu', id)
      },
      clickNote (id, index) {
        this.$store.commit('setActiveNoteIndex', index)
        this.$store.commit('setActiveNoteId', id)
        this.$store.dispatch('addNoteToHistory', id)
        this.$store.dispatch('defineFirstMark')
        this.$store.dispatch('scrollToActiveNoteLink')
      },
      toggleStar (id, index) {
        this.$store.dispatch('toggleNoteStar', {id: id, index: this.$store.getters.getAbsoluteNoteIndex(index)})
      },
      setEditorInitTab (id, index) {
        this.$store.commit('setEditorInitTab', 2)
        this.openEditNotePage(id, index)
      },
      selectNote (id, event) {
        this.$store.dispatch('selectNote', {'id': id, 'value': event})
      },
      activeNoteActionsKeydown (event) {
        if (event.ctrlKey) {
          return
        }
        if (event.code === 'KeyD') {
          this.actionDeleteNote(this.$store.state.Store.activeNoteId, this.$store.state.Store.notes[this.$store.state.Store.activeNoteIndex].deleted)
          event.preventDefault()
        } else if (event.code === 'KeyE') {
          // this.clickNote(this.$store.state.Store.activeNoteId, this.$store.state.Store.activeNoteIndex)
          this.openEditNotePage(this.$store.state.Store.activeNoteId, this.$store.state.Store.activeNoteIndex)
          event.preventDefault()
        } else if (event.code === 'KeyR') {
          // this.clickNote(this.$store.state.Store.activeNoteId, this.$store.state.Store.activeNoteIndex)
          this.setEditorInitTab(this.$store.state.Store.activeNoteId, this.$store.state.Store.activeNoteIndex)
          event.preventDefault()
        } else if (event.code === 'KeyS') {
          this.clickNote(this.$store.state.Store.activeNoteId, this.$store.state.Store.activeNoteIndex)
          this.toggleStar(this.$store.state.Store.activeNoteId, this.$store.state.Store.activeNoteIndex)
          event.preventDefault()
        } else if (event.code === 'KeyC' && event.shiftKey) {
          this.clickNote(this.$store.state.Store.activeNoteId, this.$store.state.Store.activeNoteIndex)
          this.cloneNote(this.$store.state.Store.activeNoteId)
          event.preventDefault()
        } else if (event.code === 'KeyC' && !event.shiftKey) {
          this.clickNote(this.$store.state.Store.activeNoteId, this.$store.state.Store.activeNoteIndex)
          if (document.getElementById('show_content_' + this.$store.state.Store.activeNoteIndex)) {
            document.getElementById('show_content_' + this.$store.state.Store.activeNoteIndex).click()
          } else {
            document.getElementById('note_content_' + this.$store.state.Store.activeNoteIndex).focus()
          }
          event.preventDefault()
        }
      }
    }
  }
</script>

<style scoped>

</style>