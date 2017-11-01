<template>
    <b-button size="sm" class="note-link btn btn-outline-primary btn-sm" :class="[{active: activeNoteIndex == index}, 'note-link', 'btn', 'btn-outline-primary', 'btn-sm']" @click="goToNote(index)" @mousedown.middle="openEditNotePage(note._id)"><icon v-show="note.star && !note.deleted" name="star"></icon> {{ note.title }}</b-button>
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
