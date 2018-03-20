<template>
    <div class="notes-pagination">
        <b-pagination size="sm"
                      :limit="2"
                      :total-rows="this.$store.state.Store.notes.length"
                      :value="this.$store.state.Store.pagerPage"
                      @input="inputPage($event)"
                      :per-page="this.$store.state.Store.pagerNotesPerPage">
        </b-pagination>
    </div>
</template>

<script>
  import Icon from '../../../../node_modules/vue-awesome/components/Icon.vue'

  export default {
    components: {Icon},
    props: [],
    computed: {},
    methods: {
      inputPage (event) {
        this.$store.commit('setPagerPage', event)
      }
    }
  }
</script>

<style scoped>

</style>