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
                            <b-btn @click="close()"><icon name="times"></icon></b-btn>
                        </b-button-group>
                    </div>
                </div>
            </div>
            <div class="content-wrap">

            </div>
        </b-container>
    </b-form>
</template>

<script>
  export default {
    name: 'about-page',
    components: {},
    computed: {
      keymap () {
        return {
          'esc': this.close
        }
      }
    },
    mounted () {},
    methods: {
      close () {
        this.$store.commit('setWindowMustBeHidden', false)
        this.$router.replace('/')
      }
    }
  }
</script>

<style></style>