<template>
    <b-container fluid class="screen enter-master-password">
        <div class="content-wrap">
            <div class="row justify-content-md-center" style="width: 100%">
                <div class="col-6" style="margin-top: 20px">
                    <b-form-group id="InputGroup1"
                                  label="Enter master password:">
                        <b-form-input id="Password"
                                      type="password"
                                      ref="password"
                                      autofocus
                                      @keyup.enter.native="submit()"
                                      @input="inputPassword($event)">
                        </b-form-input>
                    </b-form-group>
                    <div class="row justify-content-md-center">
                        <b-button type="button" variant="primary" @click="submit()">Sign In</b-button>
                    </div>
                </div>
            </div>

        </div>
    </b-container>
</template>

<script>
  const fs = require('fs')
  export default {
    name: 'enter-master-password-page',
    components: {},
    computed: {},
    mounted () {
      this.$refs.password.focus()
      this.$store.dispatch('loadOrCreateSettingsFile', () => {
        if (!fs.existsSync(this.$store.state.Store.settings.dbPath) && this.$store.state.Store.masterPassword === null) {
          this.$router.replace('/set-master-password')
        }
      })
    },
    data () {
      return {
        password: ''
      }
    },
    methods: {
      inputPassword (event) {
        this.password = event
      },
      submit () {
        this.$store.commit('setMasterPassword', this.password)
        this.$router.replace('/')
      }
    }
  }
</script>

<style></style>