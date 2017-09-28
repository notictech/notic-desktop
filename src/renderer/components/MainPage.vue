<template>
  <b-container fluid class="screen notes">
    <div class="topbar">
      <div class="row">
        <div class="col-6">
          <b-button-group size="sm">
            <b-btn class="btn btn-outline-primary btn-sm"><icon name="plus"></icon></b-btn>
          </b-button-group size="sm">
          <b-button-group>
            <b-btn class="btn btn-outline-primary btn-sm"><icon name="clipboard"></icon></b-btn>
          </b-button-group>
        </div>
        <div class="col-6">
          <b-input-group size="sm">
            <b-form-input class="text-left" placeholder="Search" autofocus="true"></b-form-input>
            <b-button-group size="sm">
              <b-button class="btn-outline-primary"><icon name="sticky-note"></icon></b-button>
              <b-button class="btn-outline-primary"><icon name="trash-o"></icon></b-button>
            </b-button-group>
          </b-input-group>
        </div>
      </div>
    </div>
    <div class="sidebar">
      <b-button-group vertical class="notes-links">
        <b-button size="sm" class="note-link btn btn-outline-primary btn-sm">Title</b-button>
        <b-button size="sm" class="note-link btn btn-outline-primary btn-sm">Title</b-button>
        <b-button size="sm" class="note-link btn btn-outline-primary btn-sm">Title</b-button>
        <b-button size="sm" class="note-link btn btn-outline-primary btn-sm">Title</b-button>
        <b-button size="sm" class="note-link btn btn-outline-primary btn-sm">Title</b-button>
        <b-button size="sm" class="note-link btn btn-outline-primary btn-sm">Title</b-button>
        <b-button size="sm" class="note-link btn btn-outline-primary btn-sm">Title</b-button>
        <b-button size="sm" class="note-link btn btn-outline-primary btn-sm">Title</b-button>
        <b-button size="sm" class="note-link btn btn-outline-primary btn-sm">Title</b-button>
        <b-button size="sm" class="note-link btn btn-outline-primary btn-sm">Title</b-button>
        <b-button size="sm" class="note-link btn btn-outline-primary btn-sm">Title</b-button>
        <b-button size="sm" class="note-link btn btn-outline-primary btn-sm">Title</b-button>
        <b-button size="sm" class="note-link btn btn-outline-primary btn-sm">Title</b-button>
        <b-button size="sm" class="note-link btn btn-outline-primary btn-sm">Title</b-button>
        <b-button size="sm" class="note-link btn btn-outline-primary btn-sm">Title</b-button>
        <b-button size="sm" class="note-link btn btn-outline-primary btn-sm">Title</b-button>
      </b-button-group>
    </div>
    <div class="notes">
      <b-card class="note active">
        <h4 class="title">Title</h4>
        <h6 class="card-subtitle mb-2 text-muted date">Card subtitle</h6>
        <p class="card-text content">Some quick example text to build on the <em>card title</em> and make up the bulk of the card's content.
        </p>
      </b-card>
      <b-card class="note">
        <h4 class="title">Title</h4>
        <h6 class="card-subtitle mb-2 text-muted date">Card subtitle</h6>
        <p class="card-text content">
          Some quick example text to build on the <em>card title</em> and make up the bulk of the card's content.
        </p>
      </b-card>
      <b-card class="note">
        <h4 class="title">Title</h4>
        <h6 class="card-subtitle mb-2 text-muted date">Card subtitle</h6>
        <p class="card-text content">
          Some quick example text to build on the <em>card title</em> and make up the bulk of the card's content.
        </p>
      </b-card>
      <b-card class="note">
        <h4 class="title">Title</h4>
        <h6 class="card-subtitle mb-2 text-muted date">Card subtitle</h6>
        <p class="card-text content">
          Some quick example text to build on the <em>card title</em> and make up the bulk of the card's content.
        </p>
      </b-card>
      <b-card class="note">
        <h4 class="title">Title</h4>
        <h6 class="card-subtitle mb-2 text-muted date">Card subtitle</h6>
        <p class="card-text content">
          Some quick example text to build on the <em>card title</em> and make up the bulk of the card's content.
        </p>
      </b-card>
      <b-card class="note">
        <h4 class="title">Title</h4>
        <h6 class="card-subtitle mb-2 text-muted date">Card subtitle</h6>
        <p class="card-text content">
          Some quick example text to build on the <em>card title</em> and make up the bulk of the card's content.
        </p>
      </b-card>
    </div>
  </b-container>
</template>

<script>
  import Icon from '../../../node_modules/vue-awesome/components/Icon.vue'

  export default {
    name: 'main-page',
    components: { Icon },
    methods: {}
  }
</script>

<style></style>
