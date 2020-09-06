<template>
  <a-card :bordered="false" style="margin-bottom: 20px;">
    <template slot="title"><a-icon type="bars"/> 资源限制与配额</template>
    <a-list size="small" :dataSource="resources">
      <a-list-item slot="renderItem" slot-scope="item">
        <a-col span="4">{{ item.label }}</a-col>
        <a-col span="6">
          <template v-if="item.prop === 'memoryReservations' || item.prop === 'memoryLimits'">
            <a-input-number v-model="item.value" :min="0" style="width: 200px;"/>
          </template>
          <template v-else>
            <a-slider v-model="item.value"
                      :marks="{0: '无限制', 100: '100%'}"
                      :min="0"
                      :max="100"
                      :step="5"
                      :default-value="0"
                      style="width: 200px;"/>
          </template>
        </a-col>
        <a-col span="14">
          <a-alert type="info" :message="item.tips" banner/>
        </a-col>
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
  import { convertSize } from '@/utils/util'

  export default {
    name: 'ServiceResources',
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
        this.resources.push(
          {
            prop: 'memoryReservations',
            tips: '节点上可用于运行服务调度任务的最小内存(设置为0则表示不限制)',
            label: '内存资源预留 (MB)',
            value: convertSize(this.data['Reservations']['MemoryBytes'], false, false, 1024)
          },
          {
            prop: 'memoryLimits',
            tips: '每个调度任务可用的最大内存(设置为0则表示不限制)',
            label: '内存资源限制 (MB)',
            value: convertSize(this.data['Limits']['MemoryBytes'], false, false, 1024)
          },
          {
            prop: 'cpuReservations',
            tips: '节点上可用于运行服务调度任务的最小CPU使用率',
            label: 'CPU资源预留',
            value: this.data['Reservations']['NanoCPUs'] / Math.pow(10, 9) * 100
          },
          {
            prop: 'cpuLimits',
            tips: '每个调度任务可用的最大CPU使用率',
            label: 'CPU资源限制',
            value: this.data['Limits']['NanoCPUs'] / Math.pow(10, 9) * 100
          }
        )
      }
    },
    watch: {
      data: {
        deep: true,
        immediate: true,
        handler() {
          if (Object.keys(this.data).length > 0) {
            this.renderData()
          }
        }
      }
    }
  }
</script>

<style scoped lang="less">
</style>
