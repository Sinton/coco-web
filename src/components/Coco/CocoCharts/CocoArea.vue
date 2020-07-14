<template>
  <div>
    <div class="chart-wrapper">
      <v-chart :force-fit="true"
               :height="height"
               :data="dataSource"
               :scale="scale">
        <v-tooltip/>
        <v-axis/>
        <v-point v-if="point !== null"
                 :shape="point['shape'] && point['shape'] !== null ? 'circle' : point['shape']"
                 position="x*y"/>
        <v-line position="x*y" :shape="shape" :size="2"/>
        <v-area position="x*y" :shape="shape" :opacity="0.55"/>
      </v-chart>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'CocoArea',
    props: {
      scale: {
        type: [Object, Array],
        required: true
      },
      point: {
        type: Object,
        default: null
      },
      shape: {
        type: String,
        default: 'smooth'
      },
      height: {
        type: Number,
        default: 100
      },
      dataSource: {
        type: Array,
        required: true
      }
    },
    data() {
      return {
      }
    }
  }
</script>

<style scoped lang="less">
</style>
