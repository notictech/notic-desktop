<template>
    <div :id="'notelink_index_' + index">
        <!--<input type="checkbox" v-if="this.$store.state.Store.massSelect" class="note-link-checkbox" :checked="this.$store.state.Store.selectedNotes.includes(note._id)"/>-->
        <b-form-checkbox v-if="this.$store.state.Store.massSelect" plain class="note-link-checkbox" :id="'notelink_checkbox_' + index"
                         :checked="this.$store.state.Store.selectedNotes.includes(note._id)" @change="selectNote(note._id, $event)">
            <b-button size="sm" :class="[{active: activeNoteIndex == index}, 'note-link', 'btn', 'btn-outline-primary', 'btn-sm']" @click="goToNote(index)" @mouseup.middle="openEditNotePage(note._id)" @contextmenu="showNoteContextMenu(note._id)"><icon class="is-deleted" v-show="note.deleted" name="trash"></icon><icon class="is-star" v-show="note.star" name="star"></icon><icon class="is-secret" v-show="note.secrets.length" name="key"></icon><icon class="is-reminder" v-show="note.reminder" name="bell"></icon> {{ note.title }}</b-button>
        </b-form-checkbox>
        <b-button v-if="!this.$store.state.Store.massSelect" size="sm" :class="[{active: activeNoteIndex == index}, 'note-link', 'btn', 'btn-outline-primary', 'btn-sm']" @click="goToNote(index)" @mouseup.middle="openEditNotePage(note._id, index)" @contextmenu="showNoteContextMenu(note._id, index)"><icon class="is-deleted" v-show="note.deleted" name="trash"></icon><icon class="is-star" v-show="note.star" name="star"></icon><icon class="is-secret" v-show="note.secrets.length" name="key"></icon><icon class="is-reminder" v-show="note.reminder" name="bell"></icon> {{ note.title }}</b-button>
    </div>
</template>

<script>
  import Icon from '../../../../node_modules/vue-awesome/components/Icon.vue'

  export default {
    components: {Icon},
    props: ['note', 'index'],
    computed: {
      activeNoteIndex () {
        return this.$store.state.Store.activeNoteIndex
      }
    },
    methods: {
      goToNote (index) {
        let absoluteIndex = this.$store.getters.getAbsoluteNoteIndex(index)
        this.$store.commit('setActiveNoteIndex', index)
        this.$store.commit('setActiveNoteId', this.$store.state.Store.notes[absoluteIndex]._id)
        this.$store.dispatch('addNoteToHistory', this.$store.state.Store.notes[absoluteIndex]._id)
        this.$store.dispatch('scrollToActiveNote')
        this.$store.dispatch('defineFirstMark')
      },
      openEditNotePage (id, index) {
        this.$store.commit('setActiveNoteIndex', index)
        this.$store.commit('setActiveNoteId', id)
        this.$store.dispatch('addNoteToHistory', id)
        this.$store.dispatch('openEditNotePage', id)
        this.$router.replace('/editor')
      },
      showNoteContextMenu (id, index) {
        this.$store.commit('setActiveNoteIndex', index)
        this.$store.commit('setActiveNoteId', id)
        this.$store.dispatch('addNoteToHistory', id)
        this.$store.dispatch('showNoteContextMenu', id)
      },
      selectNote (id, event) {
        this.$store.dispatch('selectNote', {'id': id, 'value': event})
      }
    }
  }
</script>

<style scoped>

</style>