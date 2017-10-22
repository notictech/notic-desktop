<template>
    <b-card :id="'note_index_' + index" :class="{note: true, active: activeNoteIndex == index}" @mousedown.middle="openEditNotePage(note._id)" @contextmenu="showNoteContextMenu(note._id)">
        <b-row>
            <b-col cols="12" md="8">
                <h4 class="title">{{ note.title }}</h4>
            </b-col>
            <b-col cols="6" md="4" style="text-align: right">
                <b-button size="sm" variant="success" v-show="searchFilter === 'deleted'" @click="restoreNote(note._id)">Restore</b-button>
                <b-dropdown class="m-md-2" size="sm">
                    <b-dropdown-item @click="openEditNotePage(note._id)"><icon name="edit"></icon> Edit</b-dropdown-item>
                    <b-dropdown-divider></b-dropdown-divider>
                    <b-dropdown-item @click="actionDeleteNote(note._id, searchFilter === 'deleted')"><icon name="trash"></icon> Delete</b-dropdown-item>
                </b-dropdown>
            </b-col>
        </b-row>
        <h6 class="card-subtitle mb-2 text-muted date">{{ formattedNoteDate }}</h6>
        <div class="reminder" v-show="note.reminder">
            <icon name="bell"></icon> <span class="details">{{ formattedReminderInfo }}</span>
        </div>
        <div class="secrets" v-show="note.secrets.length">
            <b-button size="sm" class="btn-default secret" v-for="(secret, index) in note.secrets" :key="index"><icon name="key"></icon> {{secret.title}}</b-button>
        </div>
        <div class="card-text content">{{ note.content }}</div>
    </b-card>
</template>

<script>
  import Icon from '../../../../node_modules/vue-awesome/components/Icon.vue'
  import moment from 'moment'
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
      restoreNote (id) {
        if (confirm('Are you sure you want to restore this note?')) {
          this.$store.dispatch('restoreDeletedNote', id)
        }
      },
      showNoteContextMenu (id) {
        this.$store.dispatch('showNoteContextMenu', id)
      }
    }
  }
</script>

<style scoped>

</style>
