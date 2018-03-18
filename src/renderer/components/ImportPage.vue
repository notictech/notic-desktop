<template>
    <b-form>
        <b-container fluid class="screen import-notes" v-hotkey="keymap">
            <div class="topbar">
                <div class="row" align-h="between">
                    <div class="col-6">
                        <h4>Import notes</h4>
                    </div>
                    <div class="col-6" style="text-align: right">
                        <b-button-group size="sm">
                            <b-btn variant="primary" @click="close()" title="Close (Esc)"><icon name="times"></icon></b-btn>
                        </b-button-group>
                    </div>
                </div>
            </div>
            <div class="content-wrap">
                <div class="row justify-content-md-center" style="width: 100%;">
                    <div class="col-6">
                        <b-form-group id="InputGroup1"
                                      label="Import data:">
                            <b-form-textarea id="ImportData"
                                             ref="importData"
                                             :state="!this.importDataEmpty"
                                             aria-describedby="import-data-feedback"
                                             @keyup.enter.native="submit()"
                                             :value="importData"
                                             @input="inputImportData($event)"
                                             :rows="3"
                                             :max-rows="3">
                            </b-form-textarea>
                            <div class="import-data-feedback" v-if="this.importDataEmpty">
                                Must be not empty
                            </div>
                        </b-form-group>
                        <b-form-group id="InputGroup2"
                                      label="Password:">
                            <b-form-input id="Password"
                                          type="password"
                                          ref="password"
                                          autofocus
                                          @keyup.enter.native="submit()"
                                          @input="inputPassword($event)">
                            </b-form-input>
                        </b-form-group>
                        <b-form-group id="InputGroup3" label="Repeat password:">
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
                        <div class="row justify-content-md-center">
                            <b-button type="button" variant="primary" @click="submit()">Import</b-button>
                        </div>
                    </div>
                </div>
            </div>
        </b-container>
    </b-form>
</template>

<script>
  export default {
    name: 'import-page',
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
      this.$refs.importData.focus()
      this.check()
      this.notEqual = false
      this.importDataEmpty = false
    },
    data () {
      return {
        importData: '',
        password: '',
        repeated: '',
        importDataEmpty: false,
        notEqual: false
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

        if (!this.importData.length) {
          this.importDataEmpty = true
        } else {
          this.importDataEmpty = false
        }
      },
      inputImportData (event) {
        this.importData = event.trim()
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
        if (this.notEqual || this.importDataEmpty) {
          return
        }
        this.$store.dispatch('importNotes', { importData: this.importData, password: this.password, cb: () => { this.$router.replace('/') } })
      }
    }
  }
</script>

<style></style>