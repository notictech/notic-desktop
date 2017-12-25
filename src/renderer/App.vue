<template>
  <div id="app" @keyup="trackUsing()" @click="trackUsing()">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'notic-desktop',
    methods: {
      trackUsing () {
        this.$store.dispatch('trackUsing')
      }
    }
  }
</script>

<style>
  /* CSS */
</style>
