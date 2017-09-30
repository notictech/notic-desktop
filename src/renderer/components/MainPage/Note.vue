<template>
    <b-card class="note active">
        <b-row>
            <b-col cols="12" md="8">
                <h4 class="title">{{ note.title }}</h4>
            </b-col>
            <b-col cols="6" md="4" style="text-align: right">
                <b-dropdown class="m-md-2">
                    <b-dropdown-item><icon name="edit"></icon> Edit</b-dropdown-item>
                    <b-dropdown-divider></b-dropdown-divider>
                    <b-dropdown-item><icon name="trash"></icon> Delete</b-dropdown-item>
                </b-dropdown>
            </b-col>
        </b-row>
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
