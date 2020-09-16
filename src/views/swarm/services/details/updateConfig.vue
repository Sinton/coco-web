<template>
  <a-card :bordered="false" style="margin-bottom: 20px;">
    <template slot="title"><a-icon type="bars"/> 更新配置</template>
    <a-list size="small" :dataSource="updateConfig">
      <a-list-item slot="renderItem" slot-scope="item">
        <a-col span="4">{{ item.label }}</a-col>
        <a-col span="6"></a-col>
      </a-list-item>
    </a-list>
    <div style="text-align: right;">
      <a style="float:left;">
        <a-button-group>
          <a-button type="primary" icon="check" size="small" :disabled="!changed">应用变更</a-button>
          <a-dropdown :disabled="!changed">
            <a-button type="default" icon="down" size="small"/>
            <a-menu slot="overlay">
              <a-menu-item>重置变更</a-menu-item>
            </a-menu>
          </a-dropdown>
        </a-button-group>
      </a>
    </div>
  </a-card>
</template>

<script>
  export default {
    name: 'ServiceUpdateConfig',
    props: {
      data: {
        type: Object,
        default: () => {}
      }
    },
    data() {
      return {
        updateConfig: [],
        changed: false
      }
    },
    methods: {}
  }
</script>

<style scoped lang="less">
</style>
