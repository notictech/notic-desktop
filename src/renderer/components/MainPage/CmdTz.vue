<template>
    <div class="search-cmd-area tz">
        <h1>Time zone converter</h1>
        <div class="row">
            <div class="col-3">
                <b-form-select v-model="fromTimeZone" :options="tzOptions" @input="convert()" />
                <b-input-group>
                    <b-form-input type="time" v-model="fromTime" @input="convert()"></b-form-input>
                    <b-input-group-append>
                        <b-button size="sm"  @click="now()">Now</b-button>
                    </b-input-group-append>
                </b-input-group>
                <span class="diff">{{this.diff1}}</span>
            </div>
            <b-button size="sm" @click="replace()"><icon name="arrows-alt-h"></icon></b-button>
            <div class="col-3">
                <b-form-select v-model="toTimeZone" :options="tzOptions" @input="convert()" />
                <b-input-group>
                    <b-form-input type="time" v-model="toTime" @input="convertBack()"></b-form-input>
                </b-input-group>
                <span class="diff">{{this.diff2}}</span>
            </div>
        </div>
    </div>
</template>
<script>
  import Icon from '../../../../node_modules/vue-awesome/components/Icon.vue'
  const moment = require('moment')
  const momentTz = require('moment-timezone')
  export default {
    components: {Icon},
    data () {
      return {
        diff1: null,
        diff2: null,
        fromTime: moment().format('HH:mm'),
        fromTimeZone: momentTz.tz.guess(),
        toTime: null,
        toTimeZone: momentTz.tz.guess(),
        tzOptions: []
      }
    },
    props: [],
    computed: {},
    methods: {
      convert () {
        let time1 = moment.tz(moment().format('YYYY-MM-DD ' + this.fromTime), this.fromTimeZone)
        let time2 = time1.tz(this.toTimeZone)
        this.diff1 = moment.tz(this.fromTimeZone).format('Z z')
        this.diff2 = moment.tz(this.toTimeZone).format('Z z')
        this.toTime = time2.format('HH:mm')
      },
      convertBack () {
        let time1 = moment.tz(moment().format('YYYY-MM-DD ' + this.toTime), this.toTimeZone)
        let time2 = time1.tz(this.fromTimeZone)
        this.diff1 = moment.tz(moment().format('YYYY-MM-DD ' + this.fromTime), this.fromTimeZone).format('Z z')
        this.diff2 = moment.tz(moment().format('YYYY-MM-DD ' + this.toTime), this.toTimeZone).format('Z z')
        this.fromTime = time2.format('HH:mm')
      },
      now () {
        this.fromTime = moment().format('HH:mm')
      },
      replace () {
        let temp = null
        temp = this.fromTimeZone
        this.fromTimeZone = this.toTimeZone
        this.toTimeZone = temp
        temp = this.fromTime
        this.fromTime = this.toTime
        this.toTime = temp
      }
    },
    mounted () {
      this.convert()
    },
    created () {
      let tzList = momentTz.tz.names()
      for (let i in tzList) {
        this.tzOptions.push({
          value: tzList[i],
          text: tzList[i]
        })
      }
    }
  }
</script>

<style scoped>

</style>
