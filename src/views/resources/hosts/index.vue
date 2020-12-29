<template>
  <page-view>
    <a-card :title="'主机列表'" :bordered="false">
      <div slot="extra">
        <a-button-group>
          <a-button icon="table"/>
          <a-button icon="profile"/>
        </a-button-group>
      </div>
      <div class="table-operator">
        <a-button icon="reload" @click="() => $refs['hostsRef'].refresh" >刷新</a-button>
        <a-button type="danger" icon="delete" :disabled="!selectedRows.length > 0">删除</a-button>
        <a-button type="primary" icon="plus">创建主机</a-button>
      </div>

      <s-table ref="hostsRef"
               :rowKey="record => record['id']"
               size="middle"
               :columns="columns"
               :data="loadHosts"
               :showPagination="true"
               :alert="options.alert"
               :rowSelection="options.rowSelection">
        <!-- 主机IP -->
        <template slot="ip" slot-scope="text, record">
          {{ record['host'] }}
        </template>
        <!-- 操作列-->
        <template slot="action" slot-scope="text, record">
          <a @click="terminal(record)">终端</a>
        </template>
      </s-table>
    </a-card>
    <coco-web-terminal :visible="visibleTerminal"
                       :title="'远程终端'"
                       :socket="this.$socket"
                       @close="() => this.visibleTerminal = false"
                       ref="terminalRef"/>
  </page-view>
</template>

<script>
  import { PageView } from '@/layouts'
  import { STable, CocoWebTerminal } from '@/components'
  import { invokeApi } from '@api/http'

  export default {
    name: 'Hosts',
    components: {
      CocoWebTerminal,
      PageView,
      STable
    },
    data() {
      return {
        visibleTerminal: false,
        columns: [
          {
            title: '主机IP',
            dataIndex: 'ip',
            sorter: true,
            scopedSlots: { customRender: 'ip' },
            ellipsis: true
          },
          {
            title: '操作',
            dataIndex: 'action',
            width: 100,
            scopedSlots: { customRender: 'action' }
          }
        ],
        queryParam: {},
        selectedRowKeys: [],
        selectedRows: [],

        // custom table alert & rowSelection
        options: {
          alert: {
            show: true,
            clear: () => {
              this.selectedRowKeys = []
            }
          },
          rowSelection: {
            selectedRowKeys: this.selectedRowKeys,
            onChange: this.onSelectChange
          }
        }
      }
    },
    methods: {
      loadHosts(params) {
        return invokeApi('/host/list', { ...params, ...this.queryParam }).then(response => {
          if (response.code === 2000) {
            return response.data
          } else {
            this.$notification.warning({ message: '失败', description: response.data })
          }
        })
      },
      terminal(host) {
        this.visibleTerminal = true
        this.$socket.emit('connectTerminal', {
          operate: 'connect',
          host: host['host'],
          port: host['port'],
          username: host['user'],
          password: host['password']
        })
      }
    }
  }
</script>

<style scoped lang="less">
</style>
