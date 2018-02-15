<template>
    <div :id="'notelink_index_' + index">
        <b-button size="sm" :class="[{active: activeNoteIndex == index}, 'note-link', 'btn', 'btn-outline-primary', 'btn-sm']" @click="goToNote(index)" @mousedown.middle="openEditNotePage(note._id)"><icon class="is-deleted" v-show="note.deleted" name="trash"></icon><icon class="is-star" v-show="note.star" name="star"></icon><icon class="is-secret" v-show="note.secrets.length" name="key"></icon><icon class="is-reminder" v-show="note.reminder" name="bell"></icon> {{ note.title }}</b-button>
    </div>
</template>

<script>
  import Icon from '../../../../node_modules/vue-awesome/components/Icon.vue'

  export default {
    components: {Icon},
    props: ['note', 'index'],
    computed: {
      activeNoteIndex () {
        return this.$store.state.Store.activeNoteIndex
      }
    },
    methods: {
      goToNote (index) {
        this.$store.dispatch('setActiveNoteIndex', index)
        this.$store.dispatch('setActiveNoteId', this.$store.state.Store.notes[index]._id)
        this.$store.dispatch('addNoteToHistory', this.$store.state.Store.notes[index]._id)
        this.$store.dispatch('scrollToActiveNote')
      },
      openEditNotePage (id) {
        this.$store.dispatch('openEditNotePage', id)
        this.$router.replace('/editor')
      }
    }
  }
</script>

<style scoped>

</style>