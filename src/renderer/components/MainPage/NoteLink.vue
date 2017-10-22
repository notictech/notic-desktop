<template>
    <b-button size="sm" class="note-link btn btn-outline-primary btn-sm" :class="[{active: activeNoteIndex == index}, 'note-link', 'btn', 'btn-outline-primary', 'btn-sm']" @click="goToNote(index)">{{ note.title }}</b-button>
</template>

<script>
  export default {
    props: ['note', 'index'],
    computed: {
      activeNoteIndex () {
        return this.$store.state.Store.activeNoteIndex
      }
    },
    methods: {
      goToNote (index) {
        this.$store.dispatch('setActiveNoteIndex', index)
        this.$store.dispatch('scrollToActiveNote')
      }
    }
  }
</script>

<style scoped>

</style>
