export default {
  data() {
    return {
      kvColumns: [
        {
          dataIndex: 'key',
          sorter: true,
          scopedSlots: { customRender: 'key' }
        }, {
          dataIndex: 'value',
          sorter: true,
          scopedSlots: { customRender: 'value' }
        }
      ]
    }
  },
  methods: {
    convertEnv(env) {
      if (env) {
        const envData = []
        env.forEach(item => {
          envData.push({
            key: item.split('=')[0],
            value: item.split('=')[1]
          })
        })
        return envData
      } else {
        return null
      }
    }
  }
}
