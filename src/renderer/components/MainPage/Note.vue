<template>
    <b-card class="note active">
      <h4 class="title">{{ note.title }}</h4>
      <h6 class="card-subtitle mb-2 text-muted date">{{ note.createdAt }}</h6>
        <div class="card-text content"><pre>{{ note.content }}</pre></div>
    </b-card>
</template>

<script>
  export default {
    props: ['note']
  }
</script>

<style scoped>

</style>
