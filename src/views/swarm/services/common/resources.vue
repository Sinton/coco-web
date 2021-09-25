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
                    :default-value="0"
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
  import { isNotEmpty, isNumber } from '@/utils/util'

  export default {
    name: 'CommonServiceResources',
    props: {
      data: {
        type: Object,
        default: () => {}
      },
      reset: {
        type: Boolean,
        default: () => false
      }
    },
    data() {
      return {
        resources: [],
        update: false
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
            value: this.data['memoryReservations']
          },
          {
            prop: 'memoryLimits',
            tips: '每个调度任务可用的最大内存(设置为0则表示不限制)',
            label: '内存资源限制 (MB)',
            value: this.data['memoryLimits']
          },
          {
            prop: 'cpuReservations',
            tips: '节点上可用于运行服务调度任务的最小CPU使用率',
            label: 'CPU资源预留',
            value: this.data['cpuReservations']
          },
          {
            prop: 'cpuLimits',
            tips: '每个调度任务可用的最大CPU使用率',
            label: 'CPU资源限制',
            value: this.data['cpuLimits']
          }
        )
      }
    },
    watch: {
      data: {
        deep: true,
        immediate: true,
        handler() {
          if (this.initialized) {
            this.renderData()
            if (this.update && !this.reset) {
              this.$emit('changed')
            }
            if (this.update && this.reset) {
              this.$emit('reset-after')
            }
            this.update = true
          }
        }
      }
    },
    computed: {
      initialized() {
        return isNotEmpty(this.data) && isNumber(this.data['memoryReservations'])
      }
    },
    deactivated() {
      this.update = false
    }
  }
</script>

<style scoped lang="less">
</style>
