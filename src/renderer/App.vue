<template>
    <div id="app" @keyup="trackUsage()"
         @click="trackUsage()"
         @scroll="trackUsage()">
        <router-view></router-view>
    </div>
</template>

<script>
  export default {
    name: 'notic-desktop',
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
