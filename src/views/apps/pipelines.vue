<template>
  <div>
    <coco-multiple-area :style="{ height: '45px' }"
                        :dataSource="chartData"
                        :scale="chartScale"/>
    <!--<a-card>
      &lt;!&ndash;<coco-web-terminal ref="webTerminal" :attach="true" :socket="socket" @write="write"/>&ndash;&gt;
    </a-card>
    <a-row>
      <a-col :sm="24" :md="12" :xl="6" :style="{ marginBottom: '24px' }">
        <chart-card title="内存使用率">
          <a-tooltip title="指标说明" slot="action">
            <a-icon type="info-circle-o"/>
          </a-tooltip>
          &lt;!&ndash;<coco-smooth-area :dataSource="chartData"
                            :scale="chartScale"/>&ndash;&gt;
          <coco-multiple-smooth-area :dataSource="chartData"
                                     :scale="chartScale"/>
        </chart-card>
      </a-col>
    </a-row>-->
  </div>
</template>

<script>
  import { PageView } from '@/layouts'
  import { CocoWebTerminal, CocoArea, CocoMultipleArea } from '@/components/Coco'
  import ChartCard from '@/components/Charts/ChartCard'
  import MiniArea from '@/components/Charts/MiniArea'
  import moment from 'moment'
  import { convertSize } from '@/utils/util'

  export default {
    name: 'Pipelines',
    components: {
      CocoMultipleArea,
      MiniArea,
      ChartCard,
      PageView,
      CocoWebTerminal,
      CocoArea
    },
    data() {
      return {
        socket: this.$socket,
        terminal: null,
        chartData: [],
        chartScale: [
          {
            dataKey: 'x',
            mask: 'YYYY-MM-DD HH:mm:ss'
          },
          {
            dataKey: 'y'
          }
        ]
      }
    },
    methods: {
      write(terminal) {
        this.terminal = terminal
      }
    },
    created() {
      // this.sockets.listener.subscribe('test', data => {
      //   this.terminal.writeln(data)
      // })
    },
    mounted() {
      const datetime = '2020-07-12T15:31:33'
      for (let i = 0; i < 10; i++) {
        const time = datetime.replace('31:33', '31:4' + i)
        const size1 = Math.round(Math.random() * 10)
        const size2 = Math.round(Math.random() * 10)
        this.chartData.push({
          x: moment(time).format('YYYY-MM-DD HH:mm:ss'),
          y: convertSize(size1),
          type: 'tx'
        })
        this.chartData.push({
          x: moment(time).format('YYYY-MM-DD HH:mm:ss'),
          y: convertSize(size2),
          type: 'rx'
        })
      }
    }
  }
</script>

<style scoped lang="less">
</style>
