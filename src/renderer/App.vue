<template>
    <div id="app" @keyup="trackUsage()"
         v-hotkey="keymap"
         @click="trackUsage()"
         @scroll="trackUsage()">
        <router-view></router-view>
        <div class="right-status-bar">
            <b-form-checkbox :checked="this.$store.state.Store.settings.windowOnTop"
                             title="Window on top (Ctrl+W)"
                             ref="windowOnTopCheckbox"
                             value="1"
                             unchecked-value="0"
                             plain
                             @input="toggleWindowOnTop($event)">
                top
            </b-form-checkbox>
        </div>
    </div>
</template>

<script>
  export default {
    name: 'notic-desktop',
    computed: {
      keymap () {
        return {
          'ctrl+w': this.changeWindowOnTop
        }
      }
    },
    methods: {
      trackUsage () {
        this.$store.dispatch('trackUsage')
      },
      toggleWindowOnTop (event) {
        this.$store.dispatch('toggleWindowOnTop', parseInt(event))
      },
      changeWindowOnTop () {
        let windowOnTopBool = !!this.$refs.windowOnTopCheckbox.checked
        this.toggleWindowOnTop(+!windowOnTopBool)
      }
    }
  }
</script>

<style>
  /* CSS */
</style>
