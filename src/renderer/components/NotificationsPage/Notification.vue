<template>
    <div :id="'note_index_' + index" :class="{notification: true, unread: notification.unread}" @mousedown.middle="notification.noteId ? editReminder(notification.noteId) : ''">
        <h5>
            <b-button title="Edit" size="sm" @click="editReminder(notification.noteId)" v-if="notification.noteId !== undefined"><icon name="pen"></icon></b-button>
            <b-button size="sm" variant="success" @click="markNotificationRead(notification._id, index)" v-if="notification.unread" title="Mark as read"><icon name="check"></icon></b-button>
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
    methods: {
      markNotificationRead (id, index) {
        this.$store.dispatch('markNotificationRead', {id: id, index: index})
      },
      editReminder (id) {
        this.$store.commit('setEditorInitTab', 2)
        this.$store.dispatch('editReminderFromNotifications', id)
      }
    }
  }
</script>

<style scoped>

</style>
