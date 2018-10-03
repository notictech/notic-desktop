<template>
    <div class="search-cmd-area hash">
        <h1>Hash calculator</h1>
        <div class="row">
            <div class="col-6">
                <b-form-textarea class="mb-2 mr-sm-2 mb-sm-0"
                                 placeholder="Text"
                                 v-model="text"
                                 :rows="3"
                                 :max-rows="3"></b-form-textarea>
            </div>
            <div class="col-3">
                <b-form-select class="mb-2 mr-sm-2 mb-sm-0"
                               v-model="algorithm"
                               :options="algorithmOptions">
                </b-form-select>
            </div>
            <div class="col-3">
                <b-button variant="primary" @click="calculate()">Calculate</b-button>
            </div>
        </div>
        <b-form-textarea class="result mb-2 mr-sm-2 mb-sm-0"
                         placeholder="Result"
                         v-model="result"
                         :rows="3"
                         :max-rows="3"></b-form-textarea>
    </div>
</template>

<script>
  import Icon from '../../../../node_modules/vue-awesome/components/Icon.vue'
  const crypto = require('crypto')
  export default {
    components: {Icon},
    data () {
      return {
        text: '',
        algorithm: 'sha1',
        algorithmOptions: [
          { value: null, text: 'Algorithm...' },
          { value: 'md4', text: 'md4' },
          { value: 'md5', text: 'md5' },
          { value: 'sha1', text: 'sha1' },
          { value: 'sha224', text: 'sha224' },
          { value: 'sha256', text: 'sha256' },
          { value: 'sha384', text: 'sha384' },
          { value: 'sha512', text: 'sha512' },
          { value: 'ripemd160', text: 'ripemd160' },
          { value: 'whirlpool', text: 'whirlpool' }
        ],
        result: ''
      }
    },
    props: [],
    computed: {},
    methods: {
      calculate () {
        try {
          let shasum = crypto.createHash(this.algorithm)
          shasum.update(this.text)
          this.result = shasum.digest('hex')
        } catch (e) {
          this.result = e.toString()
        }
      }
    },
    mounted () {
      this.calculate()
    }
  }
</script>

<style scoped>

</style>
