<template>
  <page-view>
    <detail-list slot="headerContent" size="small" :col="2" class="detail-layout">
      <detail-list-item v-for="(item, index) in swarmOption.details"
                        :key="index"
                        :term="item.label">
        {{ item.value }}
      </detail-list-item>
      <a-button type="link" icon="codepen">集群可视化</a-button>
    </detail-list>
    <a-card :title="'集群节点列表'" :bordered="false">
      <div slot="extra">
        <a-button-group>
          <a-button icon="table"/>
          <a-button icon="profile"/>
        </a-button-group>
      </div>
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
          <router-link :to="{ path: `nodes/${record['ID']}`, params: { nodeId: text } }">
            {{ record['Description']['Hostname'] }}
          </router-link>
          <a-tooltip placement="right">
            <a-icon type="info-circle"/>
            <template slot="title">节点ID: {{ record['ID'] }}</template>
          </a-tooltip>
        </template>
        <!-- 集群节点状态 -->
        <template slot="Status" slot-scope="text">
          <a-badge :status="text['State'] | swarmStatus('color')" :text="text['State'] | swarmStatus('text')"/>
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
      </s-table>
    </a-card>
  </page-view>
</template>

<script>
  import { PageView } from '@/layouts'
  import { STable, DetailList } from '@/components'
  import { convertSize } from '@/utils/util'
  import { invokeApi } from '@api/http'

  const DetailListItem = DetailList.Item

  export default {
    name: 'NodesList',
    components: {
      PageView,
      STable,
      DetailList,
      DetailListItem
    },
    data() {
      return {
        inspect: null,
        version: null,
        info: null,
        swarmOption: {
          details: []
        },
        queryParam: [],
        columns: [
          {
            title: '节点名',
            dataIndex: 'Hostname',
            key: 'Hostname',
            sorter: true,
            scopedSlots: { customRender: 'Hostname' }
          },
          {
            title: '状态',
            dataIndex: 'Status',
            key: 'Status',
            sorter: true,
            scopedSlots: { customRender: 'Status' }
          },
          {
            title: '资源使用',
            dataIndex: 'Resources',
            key: 'Resources',
            sorter: true,
            scopedSlots: { customRender: 'Resources' }
          },
          {
            title: '引擎版本',
            dataIndex: 'EngineVersion',
            key: 'EngineVersion',
            sorter: true,
            scopedSlots: { customRender: 'EngineVersion' }
          },
          {
            title: '集群角色',
            dataIndex: 'Role',
            key: 'Role',
            sorter: true,
            scopedSlots: { customRender: 'Role' }
          },
          {
            title: 'IP地址',
            dataIndex: 'Addr',
            key: 'Addr',
            sorter: true,
            scopedSlots: { customRender: 'Addr' }
          },
          {
            title: '更新时间',
            dataIndex: 'UpdatedAt',
            key: 'UpdatedAt',
            sorter: true,
            scopedSlots: { customRender: 'UpdatedAt' }
          },
          {
            title: '创建时间',
            dataIndex: 'CreatedAt',
            key: 'CreatedAt',
            sorter: true,
            scopedSlots: { customRender: 'CreatedAt' }
          }
        ],
        selectedRowKeys: [],
        selectedRows: [],

        // custom table alert & rowSelection
        options: {
          alert: { show: true, clear: () => { this.selectedRowKeys = [] } },
          rowSelection: {
            selectedRows: this.selectedRows,
            selectedRowKeys: this.selectedRowKeys,
            onChange: this.onSelectChange
          }
        }
      }
    },
    filters: {
      swarmStatus(text, mode) {
        const status = _.toLower(text)
        switch (status) {
          case 'paused':
            return mode === 'text' ? '已暂停' : 'default'
          case 'dead':
            return mode === 'text' ? '已失活' : 'error'
          case 'created':
            return mode === 'text' ? '已创建' : 'cyan'
          case 'exited':
            return mode === 'text' ? '已停止' : 'error'
          case '(healthy)':
            return mode === 'text' ? '健康的' : 'success'
          case '(unhealthy)':
            return mode === 'text' ? '不良的' : 'warning'
          case '(health: starting)':
            return mode === 'text' ? '启动中' : 'processing'
          default:
            return mode === 'text' ? '运行中' : 'success'
        }
      }
    },
    methods: {
      inspectSwarm() {
        invokeApi('/swarm/inspect', {}).then(response => {
          if (response.code === 2000) {
            this.inspect = response.data
            console.log(this.inspect)
          } else {
            this.globalNotification('error', '标题', '获取集群摘要信息失败')
          }
        })
        invokeApi('/docker/version', {}).then(response => {
          if (response.code === 2000) {
            this.version = response.data
            console.log(this.version)
            this.swarmOption.details.push({ label: 'Api版本', value: this.version['ApiVersion'] })
          } else {
            this.globalNotification('error', '标题', '获取集群版本信息失败')
          }
        })
        invokeApi('/docker/info', {}).then(response => {
          if (response.code === 2000) {
            this.info = response.data
            console.log(this.info)
            this.swarmOption.details.push({ label: '集群节点数', value: this.info['Swarm']['Nodes'] })
            this.swarmOption.details.push({ label: '集群CPU总核数', value: this.info['NCPU'] })
            this.swarmOption.details.push({ label: '集群内存总大小', value: convertSize(this.info['MemTotal'], true, false, 1024) })
          } else {
            this.globalNotification('error', '标题', '获取集群详细信息失败')
          }
        })
      },
      loadNodes(params) {
        return invokeApi('/node/list', { ...params, ...this.queryParam }).then(response => {
          if (response.code === 2000) {
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