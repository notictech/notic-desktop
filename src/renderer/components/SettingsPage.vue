<template>
    <b-form>
        <b-container fluid class="screen settings" v-hotkey="keymap">
            <div class="topbar">
                <div class="row" align-h="between">
                    <div class="col-6">
                        <h4>Settings</h4>
                    </div>
                    <div class="col-6" style="text-align: right">
                        <b-button size="sm" type="button" variant="success" @click="settingsSaveAndClose()"><icon name="save"></icon> Save & close</b-button>
                        <b-button-group size="sm">
                            <b-btn @click="close()"><icon name="times"></icon></b-btn>
                        </b-button-group>
                    </div>
                </div>
            </div>
            <div class="content-wrap">
                <b-form-group id="inputGroup1"
                              label="Database location:">
                    <b-input-group>
                        <b-form-input id="input1"
                                      type="text"
                                      required
                                      readonly
                                      placeholder="Path..."
                                      :value="this.dbPath">
                        </b-form-input>
                        <b-input-group-button slot="right">
                            <b-button-group>
                                <b-button title="Open" @click="openDb()"><icon name="folder-open"></icon></b-button>
                                <b-button title="Create" @click="createDb()"><icon name="plus"></icon></b-button>
                            </b-button-group>
                        </b-input-group-button>
                    </b-input-group>
                </b-form-group>
            </div>
        </b-container>
    </b-form>
</template>

<script>
  const {dialog} = require('electron').remote
  export default {
    name: 'settings-page',
    components: {},
    created () {
      this.dbPath = this.$store.state.Store.settings.dbPath
      this.masterPassword = this.$store.state.Store.masterPassword
    },
    data () {
      return {
        dbPath: '',
        masterPassword: ''
      }
    },
    computed: {
      keymap () {
        return {
          'esc': this.close,
          'ctrl+s': this.settingsSaveAndClose
        }
      }
    },
    mounted () {},
    methods: {
      settingsSaveAndClose () {
        if (this.dbPath !== this.$store.state.Store.settings.dbPath) {
          this.$store.commit('setDbPath', this.dbPath)
          this.$store.commit('setMasterPassword', this.masterPassword)
          this.$store.commit('setAppJustStarted', true)
        }
        this.$store.dispatch('settingsSaveAndClose', () => {
          this.$router.replace('/')
        })
      },
      close () {
        this.$store.commit('setWindowMustBeHidden', false)
        this.$router.replace('/')
      },
      openDb () {
        dialog.showOpenDialog({ filters: [
          { name: 'Notic database', extensions: ['ntc'] }
        ]}, (fileNames) => {
          if (fileNames === undefined) return
          let fileName = fileNames[0]
          this.dbPath = fileName
          this.masterPassword = null
        })
      },
      createDb () {
        dialog.showSaveDialog({ filters: [
          { name: 'Notic database', extensions: ['ntc'] }
        ]}, (fileName) => {
          if (fileName === undefined) return
          this.dbPath = fileName
          this.masterPassword = null
        })
      }
    }
  }
</script>

<style></style>