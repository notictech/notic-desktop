<template>
    <b-card :class="{note: true, active: activeNoteId == note._id}" @mousedown.middle="openEditNotePage(note._id)">
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
        <h6 class="card-subtitle mb-2 text-muted date">{{ note.createdAt }}</h6>
        <div class="secrets" v-show="note.secrets.length">
            <b-button size="sm" class="btn-default secret" v-for="(secret, index) in note.secrets" :key="index"><icon name="key"></icon> {{secret.title}}</b-button>
        </div>
        <div class="card-text content">{{ note.content }}</div>
    </b-card>
</template>

<script>
  export default {
    props: ['note'],
    computed: {
      activeNoteId () {
        return this.$store.state.Store.activeNoteId
      },
      searchFilter () {
        return this.$store.getters.searchFilter
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
      }
    }
  }
</script>

<style scoped>

</style>
