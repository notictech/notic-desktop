<template>
    <b-form>
        <b-container fluid class="screen set-master-password">
            <div class="topbar">
                <div class="row" align-h="between">
                    <div class="col-6">
                        <h4>Set master password</h4>
                    </div>
                </div>
            </div>
            <div class="content-wrap">
                <b-alert show variant="warning strong-password">
                    Please, come up with a strong password and remember it. Be careful! if you forgot the master
                    password, you will never be an access to your database.
                </b-alert>
                <div class="row justify-content-md-center" style="width: 100%">
                    <div class="col-6">
                        <b-form-group id="InputGroup1"
                                      label="Password:">
                            <b-form-input id="Password"
                                          type="password"
                                          ref="password"
                                          autofocus
                                          @keyup.enter.native="submit()"
                                          @input="inputPassword($event)">
                            </b-form-input>
                        </b-form-group>
                        <b-form-group id="InputGroup2" label="Repeat password:">
                            <div role="group">
                                <b-form-input id="Repeat"
                                              type="password"
                                              @keyup.enter.native="submit()"
                                              @input="inputRepeatedPassword($event)"
                                              :state="!this.notEqual"
                                              aria-describedby="input-feeback">
                                </b-form-input>
                                <div class="input-feedback" v-if="this.notEqual">
                                    Not equal
                                </div>
                            </div>
                        </b-form-group>
                        <b-alert show variant="info" v-show="this.empty">
                            The password is empty so database won't be encrypted.
                        </b-alert>
                        <div class="row justify-content-md-center">
                            <b-button type="button" variant="primary" @click="submit()">Set password</b-button>
                        </div>

                    </div>
                </div>

            </div>
        </b-container>
    </b-form>
</template>

<script>
  const {ipcRenderer} = require('electron')
  export default {
    name: 'set-master-password-page',
    components: {},
    computed: {},
    mounted () {
      this.$store.commit('setIsLoggedIn', false)
      ipcRenderer.send('set-tray-icon-inactive')
      this.$refs.password.focus()
    },
    data () {
      return {
        password: '',
        repeated: '',
        notEqual: false,
        empty: true
      }
    },
    methods: {
      check () {
        if (this.password !== this.repeated) {
          this.notEqual = true
        } else {
          this.notEqual = false
        }

        if (!this.password.length) {
          this.empty = true
        } else {
          this.empty = false
        }
      },
      inputPassword (event) {
        this.password = event
        this.check()
      },
      inputRepeatedPassword (event) {
        this.repeated = event
        this.check()
      },
      submit () {
        if (this.notEqual) {
          return
        }
        this.$store.commit('setMasterPassword', this.password)
        this.$router.replace('/')
      }
    }
  }
</script>

<style></style>