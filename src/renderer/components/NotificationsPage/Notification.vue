<template>
    <div :id="'note_index_' + index" :class="{notification: true, unread: notification.unread}">
        <h5>
            <b-button size="sm" variant="success">Read</b-button>
        </h5>
        <h1>{{ notification.title }}</h1>
        <h2>{{ notification.date }}</h2>
        <h4>{{ notification.content }}</h4>
    </div>
</template>

<script>
  import Icon from '../../../../node_modules/vue-awesome/components/Icon.vue'
  export default {
    components: {Icon},
    props: ['notification', 'index'],
    computed: {},
    methods: {}
  }
</script>

<style scoped>

</style>
