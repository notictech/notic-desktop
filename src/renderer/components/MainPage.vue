<template>
  <b-container fluid class="screen notes">
    <b-navbar class="topbar">
      <b-button-toolbar aria-label="Toolbar with button groups and dropdown menu">
        <b-button-group class="mx-1">
          <b-btn><icon name="plus"></icon></b-btn>
          <b-btn>Edit</b-btn>
          <b-btn>Undo</b-btn>
        </b-button-group>
        <b-dropdown class="mx-1" right text="menu">
          <b-dropdown-item>Item 1</b-dropdown-item>
          <b-dropdown-item>Item 2</b-dropdown-item>
          <b-dropdown-item>Item 3</b-dropdown-item>
        </b-dropdown>
        <b-button-group class="mx-1">
          <b-btn>Save</b-btn>
          <b-btn>Cancel</b-btn>
        </b-button-group>
      </b-button-toolbar>
    </b-navbar>
  </b-container>
</template>

<script>
  export default {
    name: 'main-page',
    components: {},
    methods: {}
  }
</script>

<style></style>
