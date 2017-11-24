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
                            <b-btn @click="close()"><icon name="times"></icon></b-btn>
                        </b-button-group>
                    </div>
                </div>
            </div>
            <div class="content-wrap">
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
    },
    methods: {
      close () {
        this.$router.replace('/')
      }
    }
  }
</script>

<style></style>