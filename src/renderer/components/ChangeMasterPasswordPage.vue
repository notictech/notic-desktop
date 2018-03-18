<template>
    <b-form>
        <b-container fluid class="screen change-master-password" v-hotkey="keymap">
            <div class="topbar">
                <div class="row" align-h="between">
                    <div class="col-6">
                        <h4>Change master password</h4>
                    </div>
                    <div class="col-6" style="text-align: right">
                        <b-button-group size="sm">
                            <b-btn variant="primary" @click="close()" title="Close (Esc)"><icon name="times"></icon></b-btn>
                        </b-button-group>
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
                                      label="Current password:">
                            <b-form-input id="CurrentPassword"
                                          type="password"
                                          ref="currentPassword"
                                          autofocus
                                          :state="!this.currentPasswordNotEqual"
                                          aria-describedby="current-password-feeback"
                                          @keyup.enter.native="submit()"
                                          @input="inputCurrentPassword($event)">
                            </b-form-input>
                            <div class="current-password-feedback" v-if="this.currentPasswordNotEqual">
                                Not equal
                            </div>
                        </b-form-group>
                        <b-form-group id="InputGroup2"
                                      label="New password:">
                            <b-form-input id="CurrentPassword"
                                          type="password"
                                          ref="password"
                                          autofocus
                                          @keyup.enter.native="submit()"
                                          @input="inputPassword($event)">
                            </b-form-input>
                        </b-form-group>
                        <b-form-group id="InputGroup3" label="Repeat new password:">
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
                            <b-button type="button" variant="primary" @click="submit()">Change password</b-button>
                        </div>
                    </div>
                </div>
            </div>
        </b-container>
    </b-form>
</template>

<script>
  export default {
    name: 'change-master-password-page',
    components: {},
    computed: {
      keymap () {
        return {
          'esc': this.close
        }
      }
    },
    mounted () {
      if (!this.$store.state.Store.isLoggedIn) {
        this.$router.replace('/')
      }
      this.$refs.currentPassword.focus()
      this.check()
      this.notEqual = false
      this.empty = false
    },
    data () {
      return {
        currentPassword: null,
        password: '',
        repeated: '',
        currentPasswordNotEqual: false,
        notEqual: false,
        empty: true
      }
    },
    methods: {
      close () {
        this.$router.replace('/')
      },
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

        if (this.currentPassword !== this.$store.state.Store.masterPassword) {
          this.currentPasswordNotEqual = true
        } else {
          this.currentPasswordNotEqual = false
        }
      },
      inputCurrentPassword (event) {
        this.currentPassword = event !== '' ? event : null
        this.check()
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
        if (this.notEqual || this.currentPasswordNotEqual) {
          return
        }
        this.$store.dispatch('changeMasterPassword', { newPassword: this.password, cb: () => { this.$router.replace('/') } })
      }
    }
  }
</script>

<style></style>