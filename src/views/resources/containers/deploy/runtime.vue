<template>
  <div>
    <a-list-item slot="renderItem">
      <a-col span="2">重启策略：</a-col>
      <a-col span="22">
        <a-radio-group>
          <a-radio value="never">不重启</a-radio>
          <a-radio value="always">总是重启</a-radio>
          <a-radio value="onFailure">运行失败时</a-radio>
          <a-radio value="unlessStopped">除非停止</a-radio>
        </a-radio-group>
      </a-col>
    </a-list-item>
    <a-list-item slot="renderItem">
      <a-col span="2">特权模式：</a-col>
      <a-col span="22">
        <a-switch v-model="privilegedMode" checkedChildren="开" unCheckedChildren="关" style="margin-right: 5px"/>
      </a-col>
    </a-list-item>
  </div>
</template>

<script>
  export default {
    name: 'ContainerRuntime',
    props: {
      data: {
        type: Object,
        default: () => {}
      }
    },
    data() {
      return {
        restartPolicy: 'never',
        privilegedMode: false
      }
    }
  }
</script>

<style scoped lang="less">
</style>
