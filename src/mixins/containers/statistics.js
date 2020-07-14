const MAX_CHART_LIMIT = 10
const cpuChartScale = [
  {
    dataKey: 'x',
    alias: '时间',
    mask: 'HH:mm:ss',
    tickCount: 4
  },
  {
    dataKey: 'y',
    alias: 'CPU使用率',
    tickCount: 4,
    max: 100,
    min: 0
  }
]
const cpuChartData = []
const networkChartScale = [
  {
    dataKey: 'x',
    alias: '时间',
    mask: 'HH:mm:ss',
    tickCount: 4
  },
  {
    dataKey: 'y',
    alias: '网络使用率',
    tickCount: 4
  }
]
const networkChartData = []
const memoryChartScale = [
  {
    dataKey: 'x',
    alias: '时间',
    mask: 'HH:mm:ss',
    tickCount: 4
  },
  {
    dataKey: 'y',
    alias: '内存使用率',
    tickCount: 4
  }
]
const memoryChartData = []
const ioChartScale = [
  {
    dataKey: 'x',
    alias: '时间',
    mask: 'HH:mm:ss',
    tickCount: 4
  },
  {
    dataKey: 'y',
    alias: 'IO使用率',
    tickCount: 4
  }
]
const ioChartData = []

export default {
  data() {
    return {
      MAX_CHART_LIMIT,
      cpuChartScale,
      cpuChartData,
      networkChartScale,
      networkChartData,
      memoryChartScale,
      memoryChartData,
      ioChartScale,
      ioChartData,
      stats: {
        cpu: {},
        network: {},
        memory: {}
      }
    }
  }
}
