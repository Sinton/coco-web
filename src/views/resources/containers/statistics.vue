<template>
  <page-view>
    <a-row :gutter="24">
      <a-col :sm="24" :md="12" :xl="12" :style="{ marginBottom: '24px' }">
        <coco-chart-card title="内存使用率">
          <coco-area :style="{ paddingTop: '0px', height: '0px' }"
                     :dataSource="memoryChartData"
                     :scale="memoryChartScale"
                     :height="250"/>
        </coco-chart-card>
      </a-col>
      <a-col :sm="24" :md="12" :xl="12" :style="{ marginBottom: '24px' }">
        <coco-chart-card title="磁盘IO使用率">
          <coco-area :style="{ paddingTop: '0px', height: '0px' }"
                     :dataSource="ioChartData"
                     :scale="ioChartScale"
                     :height="250"/>
        </coco-chart-card>
      </a-col>
      <a-col :sm="24" :md="12" :xl="12" :style="{ marginBottom: '24px' }">
        <coco-chart-card title="CPU使用率">
          <coco-area :style="{ paddingTop: '0px', height: '0px' }"
                     :dataSource="cpuChartData"
                     :scale="cpuChartScale"
                     :height="250"/>
        </coco-chart-card>
      </a-col>
      <a-col :sm="24" :md="12" :xl="12" :style="{ marginBottom: '24px' }">
        <coco-chart-card title="网络使用率">
          <coco-multiple-area :style="{ paddingTop: '0px', height: '0px' }"
                              :dataSource="networkChartData"
                              :scale="networkChartScale"
                              :height="250"
                              type="type"/>
        </coco-chart-card>
      </a-col>
    </a-row>
    <a-card :title="'容器进程'" :bordered="false" style="margin-bottom: 20px;">
      <a-table :columns="columns"
               :dataSource="data"
               :pagination="false">
      </a-table>
    </a-card>
  </page-view>
</template>

<script>
  import { PageView } from '@/layouts'
  import { DetailList, CocoChartCard, CocoArea, CocoMultipleArea } from '@/components'
  import { invokeApi } from '@api/http'
  import { convertSize } from '@/utils/util'
  import { containers } from '@/mixins'
  import moment from 'moment'

  const DetailListItem = DetailList.Item

  export default {
    name: 'ContainerStatistics',
    components: {
      PageView,
      DetailList,
      DetailListItem,
      CocoChartCard,
      CocoArea,
      CocoMultipleArea
    },
    mixins: [containers.statistics],
    data() {
      return {
        columns: [],
        data: null,
        refreshRate: 2
      }
    },
    methods: {
      loadContainerTop(params) {
        invokeApi('/container/top', params).then(response => {
          if (response.code === 2000) {
            const title = []
            response.data['Titles'].forEach(item => {
              title.push({
                title: item,
                dataIndex: item,
                sorter: true,
                scopedSlots: { customRender: item }
              })
            })
            this.columns = title
            const data = []
            response.data['Processes'].forEach(record => {
              const item = {}
              for (let i = 0; i < this.columns.length; i++) {
                item[this.columns[i]['title']] = record[i]
              }
              data.push(item)
              this.data = data
            })
          } else {
          }
        })
      },
      loadContainerStats(params) {
        invokeApi('/container/stats', params).then(response => {
          if (response.code === 2000) {
            this.updateCpuStats(response.data)
            this.updateNetworkStats(response.data)
            this.updateMemoryStats(response.data)
          } else {
          }
        })
      },
      calculateCPUPercent(stats) {
        let cpuPercent = 0.0
        const cpuDelta = stats.currentCPUTotalUsage - stats.previousCPUTotalUsage
        const systemDelta = stats.currentCPUSystemUsage - stats.previousCPUSystemUsage

        if (systemDelta > 0.0 && cpuDelta > 0.0) {
          cpuPercent = (cpuDelta / systemDelta) * stats.cpuCores * 100.0
        }

        return cpuPercent.toFixed(2)
      },
      updateCpuStats(stats) {
        this.stats.cpu = {
          previousCPUTotalUsage: stats['precpu_stats']['cpu_usage']['total_usage'],
          previousCPUSystemUsage: stats['precpu_stats']['system_cpu_usage'],
          currentCPUTotalUsage: stats['cpu_stats']['cpu_usage']['total_usage'],
          currentCPUSystemUsage: stats['cpu_stats']['system_cpu_usage'],
          cpuCores: stats['cpu_stats']['cpu_usage']['percpu_usage']
            ? stats['cpu_stats']['cpu_usage']['percpu_usage'].length
            : 1
        }
        this.cpuChartData.push({
          x: moment(stats['read']).format('YYYY-MM-DD HH:mm:ss'),
          y: this.calculateCPUPercent(this.stats.cpu)
        })
        if (this.cpuChartData.length > this.MAX_CHART_LIMIT) {
          this.cpuChartData.shift()
        }
      },
      updateNetworkStats(stats) {
        if (Object.keys(stats['networks']).length > 0) {
          // 只展示第一张网卡的网络IO统计数据
          const key = Object.keys(stats['networks'])[0]
          this.networkChartData.push({
            x: moment(stats['read']).format('YYYY-MM-DD HH:mm:ss'),
            y: convertSize(stats['networks'][key]['rx_bytes']),
            type: 'RX eth0'
          })
          this.networkChartData.push({
            x: moment(stats['read']).format('YYYY-MM-DD HH:mm:ss'),
            y: convertSize(stats['networks'][key]['tx_bytes']),
            type: 'TX eth0'
          })
        }
        if (this.networkChartData.length > this.MAX_CHART_LIMIT) {
          this.networkChartData.shift()
        }
      },
      updateMemoryStats(stats) {
        this.memoryChartData.push({
          x: moment(stats['read']).format('YYYY-MM-DD HH:mm:ss'),
          y: convertSize(stats['memory_stats']['usage'] - stats['memory_stats']['stats']['cache'])
        })
        if (this.memoryChartData.length > this.MAX_CHART_LIMIT) {
          this.memoryChartData.shift()
        }
      }
    },
    computed: {
      containerId() {
        return this.$route.params.id
      }
    },
    watch: {
      containerId: {
        deep: true,
        immediate: true,
        handler() {
          if (Object.keys(this.$route.params).includes('id')) {
            const params = { containerId: this.$route.params.id }
            this.loadContainerStats(params, true)
          }
        }
      }
    },
    created() {
      const params = { containerId: this.containerId }
      this.loadContainerTop(params)
    },
    mounted() {
      this.ioChartData = []
      this.cpuChartData = []
      this.memoryChartData = []
      this.networkChartData = []
      this.timer = setInterval(() => {
        const params = { containerId: this.containerId }
        this.loadContainerStats(params, true)
        this.loadContainerTop(params)
      }, this.refreshRate * 1000)
    },
    beforeDestroy() {
      clearInterval(this.timer)
    }
  }
</script>

<style scoped lang="less">
</style>
