<template>
    <div id="app"
         v-hotkey="keymap"
         @keyup="trackUsage()"
         @click="trackUsage()"
         @scroll="trackUsage()">
        <router-view></router-view>
        <div class="right-status-bar">
            <b-form-checkbox :checked="this.$store.state.Store.settings.darkTheme"
                             title="Dark theme (Ctrl+Shift+W)"
                             ref="darkThemeCheckbox"
                             value="1"
                             unchecked-value="0"
                             plain
                             @input="toggleDarkTheme($event)">
                dark
            </b-form-checkbox>
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
          'ctrl+shift+w': this.changeDarkTheme,
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
      },
      toggleDarkTheme (event) {
        this.$store.dispatch('toggleDarkTheme', parseInt(event))
      },
      changeDarkTheme () {
        let darkThemeBool = !!this.$refs.darkThemeCheckbox.checked
        this.toggleDarkTheme(+!darkThemeBool)
      }
    }
  }
</script>

<style>
  /* CSS */
</style>
