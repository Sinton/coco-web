<template>
  <div>
    <div class="chart-wrapper">
      <v-chart :force-fit="true"
               :height="height"
               :data="dataSource"
               :scale="scale">
        <v-tooltip/>
        <v-legend position="top-center"/>
        <v-axis/>
        <v-point v-if="point !== null"
                 :shape="point['shape'] && point['shape'] !== null ? 'circle' : point['shape']"
                 position="x*y"/>
        <v-line position="x*y" :shape="shape" :color="type" :size="2" />
        <v-area position="x*y" :shape="shape" :color="type" opacity="0.85"/>
      </v-chart>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'CocoMultipleArea',
    props: {
      type: {
        type: String,
        default: 'type'
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
      scale: {
        type: [Object, Array],
        required: true
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
