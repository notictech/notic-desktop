<template>
    <b-form>
        <b-container fluid class="screen settings" v-hotkey="keymap">
            <div class="topbar">
                <div class="row" align-h="between">
                    <div class="col-6">
                        <h4>Settings</h4>
                    </div>
                    <div class="col-6" style="text-align: right">
                        <b-button title="Ctrl+S" size="sm" type="button" variant="success" @click="settingsSaveAndClose()"><icon name="save"></icon> Save & close</b-button>
                        <b-button-group size="sm">
                            <b-btn variant="primary" @click="close()" title="Close (Esc)"><icon name="times"></icon></b-btn>
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
                        <b-input-group-append>
                            <b-button ref="settingsOpenDb" size="sm" title="Open database" @click="openDb()"><icon name="folder-open"></icon></b-button>
                            <b-button size="sm" title="Create database" @click="createDb()"><icon name="plus"></icon></b-button>
                        </b-input-group-append>
                    </b-input-group>
                </b-form-group>
                <b-form-group id="inputGroup2" v-if="this.$store.state.Store.isLoggedIn"
                              label="Alternative keyboard layout:">
                    <b-input-group>
                        <b-form-select size="sm" v-model="localKeymap" :options="localKeymaps" class="mb-3"></b-form-select>
                    </b-input-group>
                </b-form-group>
                <b-form-group id="inputGroup3" v-if="this.$store.state.Store.isLoggedIn"
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
                        <b-button-group style="margin-left: 10px">
                            <b-button size="sm" @click="clearHistory()"><icon name="trash"></icon> Clear history</b-button>
                        </b-button-group>
                    </b-input-group>
                </b-form-group>
                <b-form-group id="inputGroup4" v-if="this.$store.state.Store.isLoggedIn"
                              label="Automatically logout after:">
                    <b-input-group>
                        <b-form-input id="input4"
                                      type="number"
                                      size="sm"
                                      min="0"
                                      max="1440"
                                      style="flex: none; width: 100px;"
                                      required
                                      v-model="logoutAfter"
                                      :value="this.logoutAfter">
                        </b-form-input>&nbsp;minutes of inactivity ("0" for disabling)
                    </b-input-group>
                </b-form-group>
                <b-form-group id="inputGroup5" v-if="this.$store.state.Store.isLoggedIn"
                              label="Automatically erase clipboard after:">
                    <b-input-group>
                        <b-form-input id="input5"
                                      type="number"
                                      size="sm"
                                      min="0"
                                      max="60"
                                      style="flex: none; width: 100px;"
                                      required
                                      v-model="eraseClipboardAfter"
                                      :value="this.eraseClipboardAfter">
                        </b-form-input>&nbsp;seconds after secret copying ("0" for disabling)
                    </b-input-group>
                </b-form-group>
                <b-form-group id="inputGroup6" v-if="this.$store.state.Store.isLoggedIn"
                              label="Animation speed:">
                    <b-input-group>
                        <b-form-input id="input6"
                                      type="number"
                                      size="sm"
                                      min="0"
                                      max="1000"
                                      step="50"
                                      style="flex: none; width: 100px;"
                                      required
                                      v-model="animationSpeed"
                                      :value="this.animationSpeed">
                        </b-form-input>&nbsp;("0" for disabling)
                    </b-input-group>
                </b-form-group>
            </div>
        </b-container>
    </b-form>
</template>

<script>
  import Icon from '../../../node_modules/vue-awesome/components/Icon.vue'

  const {dialog} = require('electron').remote
  export default {
    name: 'settings-page',
    components: {Icon},
    mounted () {
      this.$refs.settingsOpenDb.focus()
    },
    created () {
      this.dbPath = this.$store.state.Store.settings.dbPath
      this.masterPassword = this.$store.state.Store.masterPassword
      this.localKeymap = this.$store.state.Store.settings.localKeymap
      this.historyMaxLength = this.$store.state.Store.settings.historyMaxLength
      this.logoutAfter = this.$store.state.Store.settings.logoutAfter
      this.eraseClipboardAfter = this.$store.state.Store.settings.eraseClipboardAfter
      this.animationSpeed = this.$store.state.Store.settings.animationSpeed
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
        logoutAfter: 0,
        eraseClipboardAfter: 0,
        animationSpeed: 0
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
    methods: {
      settingsSaveAndClose () {
        if (this.dbPath !== this.$store.state.Store.settings.dbPath) {
          this.$store.commit('setDbPath', this.dbPath)
          this.$store.commit('setMasterPassword', this.masterPassword)
          this.$store.commit('setAppJustStarted', true)
          this.$store.commit('setNeedReload', true)
        }

        this.$store.commit('setLocalKeymap', this.localKeymap)
        this.$store.commit('setHistoryMaxLength', parseInt(this.historyMaxLength))
        this.$store.commit('setLogoutAfter', parseInt(this.logoutAfter))
        this.$store.commit('setEraseClipboardAfter', parseInt(this.eraseClipboardAfter))
        this.$store.commit('setAnimationSpeed', parseInt(this.animationSpeed))

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
      },
      clearHistory () {
        if (confirm('Are you sure you want to clear history?')) {
          this.$store.dispatch('clearHistory')
        }
      }
    }
  }
</script>

<style></style>