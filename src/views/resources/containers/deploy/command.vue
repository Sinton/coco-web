<template>
  <a-form :form="data">
    <a-form-item v-bind="formItemLayout" label="命令">
      <a-input placeholder="例如 /usr/bin/nginx -t -c /mynginx.conf"/>
    </a-form-item>
    <a-form-item v-bind="formItemLayout" label="启动命令脚本">
      <a-input placeholder="例如 /bin/sh -c"/>
    </a-form-item>
    <a-form-item v-bind="formItemLayout" label="工作目录">
      <a-input placeholder="例如 /myapp"/>
    </a-form-item>
    <a-form-item v-bind="formItemLayout" label="用户">
      <a-input placeholder="例如 nginx"/>
    </a-form-item>
    <a-form-item v-bind="formItemLayout" label="控制台交互方式">
      <a-radio-group default-value="null">
        <a-row>
          <a-col span="12"><a-radio value="it">Interactive & TTY <span>(-i -t)</span></a-radio></a-col>
          <a-col span="12"><a-radio value="i">Interactive <span>(-i)</span></a-radio></a-col>
          <a-col span="12"><a-radio value="t">TTY <span>(-t)</span></a-radio></a-col>
          <a-col span="12"><a-radio value="null">默认</a-radio></a-col>
        </a-row>
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
      }
    },
    methods: {}
  }
</script>

<style scoped lang="less">
</style>
