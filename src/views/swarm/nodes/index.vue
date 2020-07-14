<template>
  <page-view>
    <a-card :title="'集群概要'" :bordered="false" style="margin-bottom: 25px">
      <a-list size="small" :dataSource="swarmOption">
        <a-list-item slot="renderItem" slot-scope="item">
          <a-col span="2">{{ item.label }}</a-col>
          <a-col span="22"/>
        </a-list-item>
      </a-list>
      <div class="table-operator">
        <a-button type="link" icon="codepen">集群可视化</a-button>
      </div>
    </a-card>
    <a-card :title="'集群节点列表'" :bordered="false">
      <div class="table-operator">
        <a-button icon="reload" @click="() => $refs['nodesRef'].refresh" >刷新</a-button>
        <a-button type="danger" icon="delete" :disabled="!selectedRows.length > 0">删除</a-button>
        <a-button type="primary" icon="plus">创建集群节点</a-button>
      </div>
      <s-table ref="nodesRef"
               rowKey="key"
               size="middle"
               :columns="columns"
               :data="loadNodes"
               :alert="options.alert"
               :rowSelection="options.rowSelection">
        <template slot="Hostname" slot-scope="text, record">
          {{ record['Description']['Hostname'] }}
        </template>
        <template slot="Status" slot-scope="text">
          <a-tag color="green">{{ text['State'] }}</a-tag>
        </template>
        <template slot="Resources" slot-scope="text, record">
          CPU: {{ record['Description']['Resources']['NanoCPUs'] | core }}
          <br>
          内存: {{ record['Description']['Resources']['MemoryBytes'] | size }}
        </template>
        <template slot="EngineVersion" slot-scope="text, record">
          {{ record['Description']['Engine']['EngineVersion'] }}
        </template>
        <template slot="Role" slot-scope="text, record">
          {{ record['Spec']['Role'] }}
          <br>
          {{ record['Spec']['Availability'] }}
        </template>
        <template slot="UpdatedAt" slot-scope="text">
          {{ text | moment }}
        </template>
        <template slot="CreatedAt" slot-scope="text">
          {{ text | moment }}
        </template>
        <template slot="Addr" slot-scope="text, record">
          {{ record['Status']['Addr'] }}
        </template>
        <template slot="action" slot-scope="text, record">
          <a v-if="record['Spec']['Role'] !== 'manager'">离开集群</a>
          <a-divider v-if="record['Spec']['Role'] !== 'manager'" type="vertical"/>
          <a v-if="record['Spec']['Role'] === 'manager'">释放集群</a>
        </template>
      </s-table>
    </a-card>
  </page-view>
</template>

<script>
  import { PageView } from '@/layouts'
  import { STable } from '@/components'
  import * as mixins from '@/mixins'
  import { invokeApi } from '@api/http'

  export default {
    name: 'NodesList',
    components: {
      PageView,
      STable
    },
    mixins: mixins,
    data() {
      return {
        inspect: null,
        version: null,
        info: null,
        swarmOption: {},
        queryParam: [],
        columns: [
          {
            title: '节点名',
            dataIndex: 'Hostname',
            sorter: true,
            scopedSlots: { customRender: 'Hostname' }
          },
          {
            title: '状态',
            dataIndex: 'Status',
            sorter: true,
            scopedSlots: { customRender: 'Status' }
          },
          {
            title: '资源使用',
            dataIndex: 'Resources',
            sorter: true,
            scopedSlots: { customRender: 'Resources' }
          },
          {
            title: '引擎版本',
            dataIndex: 'EngineVersion',
            sorter: true,
            scopedSlots: { customRender: 'EngineVersion' }
          },
          {
            title: '集群角色',
            dataIndex: 'Role',
            sorter: true,
            scopedSlots: { customRender: 'Role' }
          },
          {
            title: 'IP地址',
            dataIndex: 'Addr',
            sorter: true,
            scopedSlots: { customRender: 'Addr' }
          },
          {
            title: '更新时间',
            dataIndex: 'UpdatedAt',
            sorter: true,
            scopedSlots: { customRender: 'UpdatedAt' }
          },
          {
            title: '创建时间',
            dataIndex: 'CreatedAt',
            sorter: true,
            scopedSlots: { customRender: 'CreatedAt' }
          },
          {
            title: '操作',
            dataIndex: 'action',
            width: 180,
            scopedSlots: { customRender: 'action' }
          }
        ],
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
      inspectSwarm() {
        invokeApi('/swarm/inspect', {}).then(response => {
          if (response.code === 2000) {
            this.inspect = response.data
          } else {
            this.globalNotification('error', '标题', '获取集群摘要信息失败')
          }
        })
        invokeApi('/docker/version', {}).then(response => {
          if (response.code === 2000) {
            this.version = response.data
          } else {
            this.globalNotification('error', '标题', '获取集群摘要信息失败')
          }
        })
        invokeApi('/docker/info', {}).then(response => {
          if (response.code === 2000) {
            this.info = response.data
          } else {
            this.globalNotification('error', '标题', '获取集群摘要信息失败')
          }
        })
      },
      loadNodes(params) {
        return invokeApi('/node/list', { ...params, ...this.queryParam }).then(response => {
          if (response.code === 2000) {
            console.log('node', response.data)
            return response.data
          } else {
            this.globalNotification('error', '标题', '加载数据失败')
          }
        })
      },
      onSelectChange(selectedRowKeys, selectedRows) {
        this.selectedRowKeys = selectedRowKeys
        this.selectedRows = selectedRows
      },
      globalNotification(type, message, description) {
        this.$notification[type]({
          message: message,
          description: description
        })
      }
    },
    mounted() {
      this.inspectSwarm()
    }
  }
</script>

<style scoped lang="less">
</style>
