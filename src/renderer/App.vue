<template>
    <div id="app"
         v-hotkey="keymap"
         @keyup="trackUsage()"
         @click="trackUsage()"
         @scroll="trackUsage()">
        <router-view></router-view>
        <div class="right-status-bar">
            <b-form-checkbox :checked="this.$store.state.Store.settings.darkTheme"
                             title="Dark theme (Ctrl+W)"
                             ref="darkThemeCheckbox"
                             value="1"
                             unchecked-value="0"
                             plain
                             @input="toggleDarkTheme($event)">
                dark
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
          'ctrl+w': this.changeDarkTheme
        }
      }
    },
    methods: {
      trackUsage () {
        this.$store.dispatch('trackUsage')
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
