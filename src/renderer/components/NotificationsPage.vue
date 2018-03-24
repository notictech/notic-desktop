<template>
    <b-form>
        <b-container fluid class="screen notifications" v-hotkey="keymap">
            <div class="topbar">
                <div class="row" align-h="between">
                    <div class="col-6">
                        <h4>Notifications</h4>
                    </div>
                    <div class="col-6" style="text-align: right">
                        <b-button-group size="sm">
                            <b-button ref="notificationsReadAll" v-if="notifications.length" size="sm" type="button" variant="success" @click="readAll()"><icon name="check"></icon> Read all</b-button>
                        </b-button-group>
                        <b-button-group size="sm">
                            <b-button v-if="notifications.length" size="sm" type="button" variant="danger" @click="deleteAll()"><icon name="trash-o"></icon> Delete all</b-button>
                        </b-button-group>
                        <b-button-group size="sm">
                            <b-btn variant="primary" @click="close()" title="Close (Esc)"><icon name="times"></icon></b-btn>
                        </b-button-group>
                    </div>
                </div>
            </div>
            <div class="content-wrap">
                <!--<div class="banner-empty" v-if="!notifications.length">Nothing.</div>-->
                <div class="notifications" ref="notifications" id="notifications">
                    <notification v-for="(notification, index) in notifications" :notification="notification" :key="notification._id" :index="index"></notification>
                </div>
            </div>
        </b-container>
    </b-form>
</template>

<script>
  import Notification from './NotificationsPage/Notification.vue'
  export default {
    name: 'notifications-page',
    components: { Notification },
    computed: {
      keymap () {
        return {
          'esc': this.close
        }
      },
      notifications () {
        return this.$store.getters.notifications
      }
    },
    mounted () {
      if (this.$store.state.Store.appJustStarted) {
        this.$router.replace('/')
      }
      if (this.notifications.length) {
        this.$refs.notificationsReadAll.focus()
      }
    },
    methods: {
      close () {
        this.$router.replace('/')
      },
      deleteAll () {
        if (confirm('Are you sure you want to delete all notifications?')) {
          this.$store.dispatch('deleteAllNotifications')
          this.$router.replace('/')
        }
      },
      readAll () {
        this.$store.dispatch('readAllNotifications')
      }
    }
  }
</script>

<style></style>