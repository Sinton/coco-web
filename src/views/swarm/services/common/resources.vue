<template>
  <a-list size="small" :dataSource="resources">
    <a-list-item slot="renderItem" slot-scope="item">
      <a-col span="4">{{ item.label }}</a-col>
      <a-col span="8">
        <template v-if="item.prop === 'memoryReservations' || item.prop === 'memoryLimits'">
          <a-input-number v-model="item.value" :min="0" @change="() => this.changed = true" style="width: 240px;"/>
        </template>
        <template v-else>
          <a-slider v-model="item.value"
                    :marks="{0: '无限制', 100: '100%'}"
                    :min="0"
                    :max="100"
                    :step="5"
                    :default-value="0"
                    @change="() => this.changed = true"
                    style="width: 240px;"/>
        </template>
      </a-col>
      <a-col span="12">
        <a-alert type="info" :message="item.tips" :banner="true"/>
      </a-col>
    </a-list-item>
  </a-list>
</template>

<script>
  import { convertSize } from '@/utils/util'

  export default {
    name: 'CommonServiceResources',
    props: {
      data: {
        type: Object,
        default: () => {}
      }
    },
    data() {
      return {
        resources: [],
        changed: false
      }
    },
    methods: {
      renderData() {
        this.resources = []
        this.resources.push(
          {
            prop: 'memoryReservations',
            tips: '节点上可用于运行服务调度任务的最小内存(设置为0则表示不限制)',
            label: '内存资源预留 (MB)',
            value: _.isEmpty(this.data) ? 0 : _.isEmpty(this.data['Reservations']) ? 0 : convertSize(this.data['Reservations']['MemoryBytes'], false, false, 1024)
          },
          {
            prop: 'memoryLimits',
            tips: '每个调度任务可用的最大内存(设置为0则表示不限制)',
            label: '内存资源限制 (MB)',
            value: _.isEmpty(this.data) ? 0 : _.isEmpty(this.data['Limits']) ? 0 : convertSize(this.data['Limits']['MemoryBytes'], false, false, 1024)
          },
          {
            prop: 'cpuReservations',
            tips: '节点上可用于运行服务调度任务的最小CPU使用率',
            label: 'CPU资源预留',
            value: _.isEmpty(this.data) || _.isEmpty(this.data['Reservations']) ? 0 : this.data['Reservations']['NanoCPUs'] / Math.pow(10, 9) * 100
          },
          {
            prop: 'cpuLimits',
            tips: '每个调度任务可用的最大CPU使用率',
            label: 'CPU资源限制',
            value: _.isEmpty(this.data) || _.isEmpty(this.data['Limits']) ? 0 : this.data['Limits']['NanoCPUs'] / Math.pow(10, 9) * 100
          }
        )
      }
    },
    watch: {
      data: {
        deep: true,
        immediate: true,
        handler() {
          this.renderData()
        }
      }
    }
  }
</script>

<style scoped lang="less">
</style>
