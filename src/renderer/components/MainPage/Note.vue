<template>
    <b-card class="note active">
      <h4 class="title">{{ note.title }}</h4>
      <h6 class="card-subtitle mb-2 text-muted date">{{ note.createdAt }}</h6>
      <p class="card-text content">{{ note.content }}</p>
    </b-card>
</template>

<script>
  export default {
    props: ['note']
  }
</script>

<style scoped>

</style>
