export default {
  data() {
    return {
      detailsOption: {
        status: [],
        details: []
      },
      volumesOption: {
        columns: [
          {
            title: '存储卷名称 / 宿主机挂载点',
            dataIndex: 'Source',
            sorter: true,
            scopedSlots: { customRender: 'Source' },
            ellipsis: true
          },
          {
            title: '容器挂载点',
            dataIndex: 'Destination',
            sorter: true,
            scopedSlots: { customRender: 'Destination' },
            ellipsis: true
          },
          {
            title: '读写权限',
            dataIndex: 'RW',
            sorter: true,
            scopedSlots: { customRender: 'RW' }
          },
          {
            title: '存储驱动',
            dataIndex: 'Driver',
            sorter: true,
            scopedSlots: { customRender: 'Driver' }
          }
        ],
        data: null
      },
      networksOption: {
        columns: [
          {
            title: '网络名称',
            dataIndex: 'Network',
            sorter: true,
            scopedSlots: { customRender: 'Network' }
          },
          {
            title: '容器IP地址',
            dataIndex: 'IPAddress',
            sorter: true,
            scopedSlots: { customRender: 'IPAddress' }
          },
          {
            title: '容器Mac地址',
            dataIndex: 'MacAddress',
            sorter: true,
            scopedSlots: { customRender: 'MacAddress' }
          },
          {
            title: '容器网关地址',
            dataIndex: 'Gateway',
            sorter: true,
            scopedSlots: { customRender: 'Gateway' }
          },
          {
            title: '操作',
            dataIndex: 'action',
            scopedSlots: { customRender: 'action' }
          }
        ],
        data: []
      }
    }
  }
}
