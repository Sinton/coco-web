<template>
  <a-list size="small" :dataSource="resources">
    <a-list-item slot="renderItem" slot-scope="item">
      <a-col span="4">{{ item.label }}</a-col>
      <a-col span="8">
        <template v-if="item.prop === 'memoryReservations' || item.prop === 'memoryLimits'">
          <a-input-number v-model="data[item.prop]" :min="0" style="width: 240px;"/>
        </template>
        <template v-else>
          <a-slider v-model="data[item.prop]"
                    :marks="{0: '无限制', 100: '100%'}"
                    :min="0"
                    :max="100"
                    :step="5"
                    :default-value="item.value"
                    style="width: 240px;"/>
        </template>
      </a-col>
      <a-col span="12">
        <a-alert type="info" :message="item.tips" banner/>
      </a-col>
    </a-list-item>
  </a-list>
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
        resources: []
      }
    },
    methods: {
      renderData() {
        this.resources = []
        this.resources.push(
          {
            prop: 'memoryReservations',
            tips: '容器用于运行服务调的最小内存(设置为0则表示不限制)',
            label: '内存资源预留 (MB)：',
            value: this.data['memoryReservations']
          },
          {
            prop: 'memoryLimits',
            tips: '容器可用的最大内存(设置为0则表示不限制)',
            label: '内存资源限制 (MB)：',
            value: this.data['memoryLimits']
          },
          {
            prop: 'cpuLimits',
            tips: '容器可用的最大CPU使用率',
            label: 'CPU资源限制：',
            value: this.data['cpuLimits']
          }
        )
      }
    },
    mounted() {
      this.renderData()
    }
  }
</script>

<style scoped lang="less">
</style>
