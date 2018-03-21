<template>
    <b-form>
        <b-container fluid class="screen help" v-hotkey="keymap">
            <div class="topbar">
                <div class="row" align-h="between">
                    <div class="col-6">
                        <!--<h4>Help</h4>-->
                    </div>
                    <div class="col-6" style="text-align: right">
                        <b-button-group size="sm">
                            <b-btn variant="primary" @click="close()" title="Close (Esc)"><icon name="times"></icon></b-btn>
                        </b-button-group>
                    </div>
                </div>
            </div>
            <div class="content-wrap">
                <div class="tutorial">
                    <vue-markdown :source="this.tutorial"></vue-markdown>
                </div>
            </div>
        </b-container>
    </b-form>
</template>

<script>
  import VueMarkdown from 'vue-markdown'
  const fs = require('fs')
  export default {
    name: 'help-page',
    components: { VueMarkdown },
    mounted () {
      fs.readFile('static/notic_tutorial_ru.md', 'utf8', (err, data) => {
        if (err) {
          console.log('ERROR: ' + err)
        }
        if (data) {
          this.tutorial = data
        }
      })
    },
    data () {
      return {
        tutorial: ''
      }
    },
    computed: {
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