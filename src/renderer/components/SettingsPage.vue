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
                                      size="sm"
                                      required
                                      readonly
                                      placeholder="Path..."
                                      :value="this.dbPath">
                        </b-form-input>
                        <b-input-group-button slot="right">
                            <b-button-group>
                                <b-button size="sm" title="Open" @click="openDb()"><icon name="folder-open"></icon></b-button>
                                <b-button size="sm" title="Create" @click="createDb()"><icon name="plus"></icon></b-button>
                            </b-button-group>
                        </b-input-group-button>
                    </b-input-group>
                </b-form-group>
                <b-form-group id="inputGroup2"
                              label="Alternative keyboard layout:">
                    <b-input-group>
                        <b-form-select size="sm" v-model="localKeymap" :options="localKeymaps" class="mb-3"></b-form-select>
                    </b-input-group>
                </b-form-group>
                <b-form-group id="inputGroup3"
                              label="History max length:">
                    <b-input-group>
                        <b-form-input id="input3"
                                      type="number"
                                      size="sm"
                                      min="0"
                                      max="100"
                                      required
                                      v-model="historyMaxLength"
                                      :value="this.historyMaxLength">
                        </b-form-input>
                    </b-input-group>
                </b-form-group>
                <b-form-group id="inputGroup4"
                              label="Automatically logout the app after:">
                    <b-input-group>
                        <b-form-input id="input4"
                                      type="number"
                                      size="sm"
                                      min="0"
                                      max="1440"
                                      style="flex: none; width: 100px;"
                                      required
                                      :value="this.logoutAfter">
                        </b-form-input>&nbsp;minutes of inactivity ("0" for disabling)
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
      this.localKeymap = this.$store.state.Store.settings.localKeymap
      this.historyMaxLength = this.$store.state.Store.settings.historyMaxLength
      this.logoutAfter = this.$store.state.Store.settings.logoutAfter
    },
    data () {
      return {
        dbPath: '',
        masterPassword: '',
        localKeymap: '',
        localKeymaps: [
          { value: 'ru', text: 'Russian (RU)' }
        ],
        historyMaxLength: 0,
        logoutAfter: 0
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

        this.$store.commit('setLocalKeymap', this.localKeymap)
        this.$store.commit('setHistoryMaxLength', parseInt(this.historyMaxLength))
        this.$store.commit('setLogoutAfter', parseInt(this.logoutAfter))

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