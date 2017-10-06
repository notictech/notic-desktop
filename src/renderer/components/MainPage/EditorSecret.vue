<template>
    <b-button-toolbar class="editor-secret">
        <b-button-group size="sm" class="mx-1">
            <b-form-input size="sm"
                          class="text-left"
                          placeholder="Title"
                          @input="changeTitle(index, $event)"
                          :value="secret.title"
            ></b-form-input>
        </b-button-group>
        <b-button-group size="sm" class="mx-1">
            <b-form-input :type="secret.visibility ? 'text' : 'password'"
                          size="sm"
                          class="text-left"
                          placeholder="Secret"
                          name="password"
                          data-toggle="password"
                          @input="changePassword(index, $event)"
                          :value="secret.content"
            ></b-form-input>
        </b-button-group>
        <b-button-group size="sm" class="mx-1">
            <b-form-input :type="secret.visibility ? 'text' : 'password'"
                          size="sm"
                          class="text-left"
                          placeholder="Repeat secret"
                          id="password"
                          name="password"
                          data-toggle="password"
                          :value="secret.contentRepeat"
            ></b-form-input>
        </b-button-group>
        <b-button-group  size="sm" class="mx-1">
            <b-btn @click="toggleVisibility(index)"><icon :name="secret.visibility ? 'eye-slash' : 'eye'"></icon></b-btn>
        </b-button-group>
        <b-button-group  size="sm" class="mx-1">
            <b-btn @click="genSecret(index)"><icon name="bolt"></icon></b-btn>
        </b-button-group>
        <b-button-group  size="sm" class="mx-1">
            <b-btn @click="deleteSecret(index)"><icon name="trash"></icon></b-btn>
        </b-button-group>
    </b-button-toolbar>
</template>

<script>
  export default {
    props: [
      'secret',
      'index'
    ],
    methods: {
      changeTitle (index, event) {
        this.$store.dispatch('editorUpdateSecretTitle', {index: index, data: event})
      },
      changePassword (index, event) {
        this.$store.dispatch('editorUpdateSecretContent', {index: index, data: event})
      },
      deleteSecret (index) {
        if (confirm('Are you sure you want to delete this secret?')) {
          this.$store.dispatch('editorDeleteSecret', index)
        }
      },
      toggleVisibility (index) {
        this.$store.dispatch('toggleSecretVisibility', index)
      },
      genSecret (index) {
        if (confirm('Are you sure you want to regenerate this secret?')) {
          this.$store.dispatch('genSecret', index)
        }
      }
    }
  }
</script>

<style scoped>

</style>
