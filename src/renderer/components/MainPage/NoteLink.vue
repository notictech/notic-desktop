<template>
    <b-button size="sm" class="note-link btn btn-outline-primary btn-sm">{{ note.title }}</b-button>
</template>

<script>
  export default {
    props: ['note']
  }
</script>

<style scoped>

</style>
