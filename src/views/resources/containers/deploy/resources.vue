<template>
  <a-form :form="resourceForm">
    <a-form-item v-bind="formItemLayout" label="内存最低使用配额">
      <a-slider style="float: left; width: 80%" :marks="{ 0: '无限制', 100: '100%' }" :setp="10"/>
      <a-input style="float: right; width: 15%"/>
    </a-form-item>
    <a-form-item v-bind="formItemLayout" label="内存最高使用配额">
      <a-slider style="float: left; width: 80%" :marks="{ 0: '无限制', 100: '100%' }" :setp="10"/>
      <a-input style="float: right; width: 15%"/>
    </a-form-item>
    <a-form-item v-bind="formItemLayout" label="CPU使用率配额">
      <a-slider style="width: 95%" :marks="{ 0: '无限制', 100: '100%' }" :setp="25"/>
    </a-form-item>
  </a-form>
</template>

<script>
  export default {
    name: 'ContainerResources',
    props: {
      formItemLayout: {
        type: Object,
        default: () => {}
      },
      data: {
        type: Object,
        default: () => {}
      }
    },
    data() {
      return {
        resourceForm: {
          memoryReservation: '',
          memoryLimit: '',
          cpuLimit: ''
        }
      }
    },
    methods: {}
  }
</script>

<style scoped lang="less">
</style>
