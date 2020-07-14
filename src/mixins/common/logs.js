export default {
  data() {
    return {
      stringify: false,
      logsOption: {
        logVisible: false,
        formItemLayout: {
          labelCol: {
            xs: { span: 8 },
            sm: { span: 8 }
          },
          wrapperCol: {
            xs: { span: 14 },
            sm: { span: 14 }
          }
        },
        timeFilter: [
          {
            label: '全部',
            value: 'all'
          }, {
            label: '最近一天',
            value: 'lastday'
          }, {
            label: '最近4小时',
            value: 'last4hours'
          }, {
            label: '最近1小时',
            value: 'lasthour'
          }, {
            label: '最近10分钟',
            value: 'last10min'
          }
        ]
      }
    }
  }
}
