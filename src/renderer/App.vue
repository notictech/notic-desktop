<template>
  <div id="app" @keyup="trackUsage()" @click="trackUsage()">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'notic-desktop',
    mounted () {
      this.$store.dispatch('fixWindowTitle')
    },
    methods: {
      trackUsage () {
        this.$store.dispatch('trackUsage')
      }
    }
  }
</script>

<style>
  /* CSS */
</style>
