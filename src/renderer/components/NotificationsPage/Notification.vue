<template>
    <b-card :class="{notification: true, unread: notification.unread}">
        <b-row>
            <b-col cols="12" md="8">
                <h4 class="title">{{ notification.title }}</h4>
            </b-col>
            <b-col cols="6" md="4" style="text-align: right">
                <b-button size="sm" variant="success">Read</b-button>
            </b-col>
        </b-row>
        <h6 class="card-subtitle mb-2 text-muted date">{{ notification.date }}</h6>
        <div class="card-text content">{{ notification.content }}</div>
    </b-card>
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
