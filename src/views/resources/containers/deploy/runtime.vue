<template>
  <a-form :form="restartForm">
    <a-form-item v-bind="formItemLayout" label="重启策略">
      <a-radio-group>
        <a-radio value="never">不重启</a-radio>
        <a-radio value="always">总是重启</a-radio>
        <a-radio value="failure">运行失败时</a-radio>
      </a-radio-group>
    </a-form-item>
  </a-form>
</template>

<script>
  export default {
    name: 'ContainerRuntime',
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
        restartForm: {
          restart: ''
        }
      }
    },
    methods: {}
  }
</script>

<style scoped lang="less">
</style>
