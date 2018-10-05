<template>
    <b-form>
        <b-container fluid class="screen about" v-hotkey="keymap">
            <div class="topbar">
                <div class="row" align-h="between">
                    <div class="col-6">
                        <h4>About</h4>
                    </div>
                    <div class="col-6" style="text-align: right">
                        <b-button-group size="sm">
                            <b-btn variant="primary" @click="close()" title="Close (Esc)"><icon name="times"></icon></b-btn>
                        </b-button-group>
                    </div>
                </div>
            </div>
            <div class="content-wrap" style="text-align: center">
                <b-img src="static/icons/notic-logo.png" fluid/>
                <h3 style="margin-top: 10px;">Notic</h3>
                <br>
                <p>Version: 1.5.2 alpha</p>
                <p>License: <a href="#" @click="require('electron').shell.openExternal('http://www.gnu.org/licenses/gpl.html')">GPLv3</a></p>
                <p>Contact email: notictech@gmail.com</p>
                <p>Website: <a href="#" @click="require('electron').shell.openExternal('https://github.com/notictech/notic-desktop')">github.com/notictech/notic-desktop</a></p>
                <p>© 2016 - <span>{{ this.currentYear }}</span> Sergey Tolokonnikov</p>
            </div>
        </b-container>
    </b-form>
</template>

<script>
  export default {
    name: 'about-page',
    components: {},
    computed: {
      currentYear () {
        return require('moment')().format('YYYY')
      },
      keymap () {
        return {
          'esc': this.close
        }
      }
    },
    methods: {
      close () {
        this.$store.commit('setWindowMustBeHidden', false)
        this.$router.replace('/')
      }
    }
  }
</script>

<style></style>
