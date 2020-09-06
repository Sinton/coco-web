<template>
  <a-form :form="commandForm">
    <a-form-item v-bind="formItemLayout" label="命令">
      <a-input/>
    </a-form-item>
    <a-form-item v-bind="formItemLayout" label="启动命令脚本">
      <a-input/>
    </a-form-item>
    <a-form-item v-bind="formItemLayout" label="工作目录">
      <a-input/>
    </a-form-item>
    <a-form-item v-bind="formItemLayout" label="用户">
      <a-input/>
    </a-form-item>
    <a-form-item v-bind="formItemLayout" label="控制台交互方式">
      <a-radio-group default-value="null">
        <a-radio value="it">Interactive & TTY</a-radio>
        <a-radio value="i">Interactive</a-radio>
        <a-radio value="t">TTY</a-radio>
        <a-radio value="null">默认</a-radio>
      </a-radio-group>
    </a-form-item>
  </a-form>
</template>

<script>
  export default {
    name: 'ContainerCommand',
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
        commandForm: {
          command: '',
          entryPoint: '',
          workingDir: '',
          user: '',
          console: 'null'
        }
      }
    },
    methods: {}
  }
</script>

<style scoped lang="less">
</style>
