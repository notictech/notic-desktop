<template>
    <b-button size="sm" class="note-link btn btn-outline-primary btn-sm"  :class="[{active: activeNoteId == note._id}, 'note-link', 'btn', 'btn-outline-primary', 'btn-sm']">{{ note.title }}</b-button>
</template>

<script>
  export default {
    props: ['note'],
    computed: {
      activeNoteId () {
        return this.$store.state.Store.activeNoteId
      }
    }
  }
</script>

<style scoped>

</style>
