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
                <b-form-group id="exampleInputGroup1" label-for="titleInput">
                    <b-form-input id="titleInput" type="text" class="title" placeholder="Title" @input="editorChangeTitle($event)" :value="noteTitle"></b-form-input>
                </b-form-group>
                <b-form-group id="exampleInputGroup2" label-for="contentTextArea">
                    <b-form-textarea id="contentTextArea"
                                     ref="content"
                                     class="content"
                                     placeholder="Content"
                                     :rows="15" autofocus @input="editorChangeContent($event)"  :value="noteContent">
                    </b-form-textarea>
                </b-form-group>
                <h4>Secrets</h4>
                <div class="secrets">
                    <editor-secret v-for="(secret, index) in noteSecrets" :key="index" :index="index" :secret="secret"></editor-secret>
                </div>
                <b-button style="margin-top: 10px;" @click="editorAddSecret()"><icon name="key"></icon> Add secret</b-button>
            </div>
        </b-container>
    </b-form>
</template>

<script>
  import EditorSecret from '../components/MainPage/EditorSecret.vue'
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
      }
    }
  }
</script>

<style></style>