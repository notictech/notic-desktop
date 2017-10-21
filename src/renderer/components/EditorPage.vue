<template>
    <b-form>
        <b-container fluid class="screen editor">
            <div class="topbar">
                <div class="row" align-h="between">
                    <div class="col-6">
                        <h4 v-if="editorMode === 'add'">Add note</h4>
                        <h4 v-else>Edit note</h4>
                    </div>
                    <div class="col-6" style="text-align: right">
                        <b-button type="button" variant="success" @click="editorSaveAndClose()"><icon name="save"></icon> Save & close</b-button>
                        <b-button-group>
                            <b-btn @click="close()"><icon name="times"></icon></b-btn>
                        </b-button-group>
                    </div>
                </div>
            </div>
            <div class="content-wrap">

                <b-tabs card small no-fade>
                    <b-tab title="Editor" active>
                        <b-form-group id="exampleInputGroup1" label-for="titleInput">
                            <b-form-input id="titleInput" type="text" class="title" placeholder="Title" @input="editorChangeTitle($event)" :value="noteTitle"></b-form-input>
                        </b-form-group>
                        <b-form-group id="exampleInputGroup2" label-for="contentTextArea">
                            <b-form-textarea id="contentTextArea"
                                             ref="content"
                                             class="content"
                                             placeholder="Content"
                                             :rows="20" autofocus @input="editorChangeContent($event)"  :value="noteContent"
                            ></b-form-textarea>
                        </b-form-group>
                    </b-tab>
                    <b-tab title="Secrets">
                        <div class="secrets">
                            <editor-secret v-for="(secret, index) in noteSecrets" :key="index" :index="index" :secret="secret"></editor-secret>
                        </div>
                        <b-button style="margin-top: 10px;" @click="editorAddSecret()"><icon name="plus"></icon> Add</b-button>
                    </b-tab>
                    <b-tab title="Reminder">
                        <b-button-toolbar aria-label="Toolbar with button groups and input groups">
                            <b-button-group size="sm" class="mx-1">
                                <b-form-checkbox id="checkbox1" value="true" :checked="noteReminder" @change="editorToggleReminder()">Remind me </b-form-checkbox>
                            </b-button-group>
                            <span v-show="noteReminder">
                            <b-button-group size="sm" class="mx-1">
                                <b-form-input size="sm" type="date" :value="noteReminderDate" @change="editorChangeReminderDate($event)"></b-form-input>
                            </b-button-group>
                            <b-button-group size="sm" class="mx-1"> at </b-button-group>
                            <b-button-group size="sm" class="mx-1">
                                <b-form-input size="sm" type="time" :value="noteReminderTime" @change="editorChangeReminderTime($event)"></b-form-input>
                            </b-button-group>
                            <b-button-group size="sm" class="mx-1"> and repeat </b-button-group>
                            <b-button-group size="sm" class="mx-1">
                                <b-form-select :value="noteReminderRepeat" @input="editorChangeReminderRepeat($event)">
                                    <option value="0">never</option>
                                    <option value="10">every minute</option>
                                    <option value="20">every hour</option>
                                    <option value="30">every day</option>
                                    <option value="40">every week</option>
                                    <option value="50">every month</option>
                                    <option value="60">every year</option>
                                </b-form-select>
                            </b-button-group>
                            </span>

                        </b-button-toolbar>
                    </b-tab>
                </b-tabs>
            </div>
        </b-container>
    </b-form>
</template>

<script>
  import EditorSecret from '../components/MainPage/EditorSecret.vue'
  import moment from 'moment'
  export default {
    name: 'editor-page',
    components: { EditorSecret },
    computed: {
      editorMode () {
        return this.$store.state.Store.editorMode
      },
      noteTitle () {
        return this.$store.state.Store.note.title
      },
      noteContent () {
        return this.$store.state.Store.note.content
      },
      noteSecrets () {
        return this.$store.state.Store.note.secrets
      },
      noteReminder () {
        return this.$store.state.Store.note.reminder
      },
      noteReminderDate () {
        return moment(this.$store.state.Store.note.reminderDate).format('YYYY-MM-DD')
      },
      noteReminderTime () {
        return this.$store.state.Store.note.reminderTime
      },
      noteReminderRepeat () {
        return this.$store.state.Store.note.reminderRepeat
      }
    },
    mounted () {
      this.$refs.content.focus()
    },
    methods: {
      close () {
        this.$router.replace('/')
      },
      editorChangeTitle (event) {
        this.$store.dispatch('editorChangeTitle', event)
      },
      editorChangeContent (event) {
        this.$store.dispatch('editorChangeContent', event)
      },
      editorSaveAndClose () {
        this.$store.dispatch('editorSaveAndClose', () => {
          this.$router.replace('/')
        })
      },
      editorAddSecret () {
        this.$store.dispatch('editorAddSecret')
      },
      editorToggleReminder () {
        this.$store.dispatch('editorToggleReminder')
      },
      editorChangeReminderDate (event) {
        this.$store.dispatch('editorChangeReminderDate', event)
      },
      editorChangeReminderTime (event) {
        this.$store.dispatch('editorChangeReminderTime', event)
      },
      editorChangeReminderRepeat (event) {
        this.$store.dispatch('editorChangeReminderRepeat', event)
      }
    }
  }
</script>

<style></style>