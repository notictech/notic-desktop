<template>
  <b-container fluid class="screen editor">
    <b-form>
      <div class="topbar">
        <div class="row" align-h="between">
          <div class="col-6">
            <h4>Add note</h4>
          </div>
          <div class="col-6" style="text-align: right">
            <b-button type="submit" variant="success"><icon name="save"></icon> Save & close</b-button>
            <b-button-group>
              <b-btn @click="close()"><icon name="times"></icon></b-btn>
            </b-button-group>
          </div>
        </div>
      </div>
      <div class="content-wrap">
        <b-form-group id="exampleInputGroup1" label-for="titleInput">
          <b-form-input id="titleInput" type="email" required placeholder="Title"></b-form-input>
        </b-form-group>
        <b-form-group id="exampleInputGroup2" label-for="contentTextArea">
          <b-form-textarea id="contentTextArea"
                           placeholder="Content"
                           :rows="15">
          </b-form-textarea>
        </b-form-group>
      </div>
    </b-form>
  </b-container>
</template>

<script>
  export default {
    name: 'editor-page',
    methods: {
      close () {
        this.$store.dispatch('closeAddNotePage')
        this.$router.replace('/')
      }
    }
  }
</script>

<style></style>