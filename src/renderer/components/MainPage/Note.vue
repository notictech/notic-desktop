<template>
    <div :id="'note_index_' + index" :class="{note: true, active: activeNoteIndex == index}" @mousedown.middle="openEditNotePage(note._id)" @contextmenu="showNoteContextMenu(note._id)" @click="clickNote(note._id, index)">
        <h5>
            <b-button size="sm" variant="success" v-if="searchFilter === 'deleted'" @click="restoreNote(note._id)">Restore</b-button>
            <b-button title="Mark as favorite" size="sm" v-if="!note.deleted" :variant="note.star ? 'warning' : ''" @click="toggleStar(note._id, index)"><icon name="star"></icon></b-button>
            <!--<b-button title="Edit" size="sm" @click="openEditNotePage(note._id)"><icon name="pencil"></icon></b-button>-->
            <!--<b-button title="Delete" size="sm" @click="actionDeleteNote(note._id, searchFilter === 'deleted')"><icon name="trash"></icon></b-button>-->
            <b-dropdown class="m-md-2" size="sm">
                <b-dropdown-item @click="openEditNotePage(note._id)"><icon name="pencil"></icon> Edit</b-dropdown-item>
                <b-dropdown-item @click="cloneNote(note._id)"><icon name="files-o"></icon> Clone</b-dropdown-item>
                <b-dropdown-item @click="actionDeleteNote(note._id, searchFilter === 'deleted')"><icon name="trash"></icon> Delete</b-dropdown-item>
            </b-dropdown>
        </h5>
        <h1>{{ note.title }}</h1>
        <h2>{{ formattedNoteDate }}
            <b-button class="note-reminder-btn" size="sm" :variant="(note.reminder) ? 'outline-danger' : 'outline-secondary'" @click="setEditorInitTab(note._id)"><icon name="bell"></icon></b-button><span v-show="note.reminder">{{ formattedReminderInfo }}</span>
        </h2>
        <h3 v-show="note.secrets.length">
            <b-button size="sm" variant="info" v-for="(secret, index) in note.secrets" :key="index" @click="copySecret(secret.content)" title="Click for copy"><icon name="key"></icon> {{secret.title}}</b-button>
        </h3>
        <h4>{{ note.content }}</h4>
    </div>
</template>

<script>
  import Icon from '../../../../node_modules/vue-awesome/components/Icon.vue'
  import moment from 'moment'
  const {clipboard} = require('electron')
  export default {
    components: {Icon},
    props: ['note', 'index'],
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
      openEditNotePage (id) {
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
      showNoteContextMenu (id) {
        this.$store.dispatch('showNoteContextMenu', id)
      },
      clickNote (id, index) {
        this.$store.dispatch('setActiveNoteIndex', index)
        this.$store.dispatch('setActiveNoteId', id)
        this.$store.dispatch('addNoteToHistory', id)
        // this.$store.dispatch('scrollToActiveNoteLink')
      },
      toggleStar (id, index) {
        this.$store.dispatch('toggleNoteStar', {id: id, index: index})
      },
      setEditorInitTab (id) {
        this.$store.commit('setEditorInitTab', 2)
        this.openEditNotePage(id)
      }
    }
  }
</script>

<style scoped>

</style>