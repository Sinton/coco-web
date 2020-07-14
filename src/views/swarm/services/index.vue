<template>
  <page-view>
    <a-card :title="'服务列表'" :bordered="false">
      <div class="table-operator">
        <a-button icon="reload" @click="() => $refs['servicesRef'].refresh()">刷新</a-button>
        <a-button type="danger" icon="delete" :disabled="!selectedRows.length > 0">删除</a-button>
        <a-button type="primary" icon="plus">创建服务</a-button>
      </div>
      <s-table ref="servicesRef"
               rowKey="key"
               size="middle"
               :columns="columns"
               :data="loadServices"
               :alert="options.alert"
               :rowSelection="options.rowSelection"
               @expand="expandedChanged">
        <template slot="ID" slot-scope="text, record">
          <router-link :to="{ path: `services/${text}`, params: {serviceId: text} }">
            {{ record['Spec']['Name'] }}
          </router-link>
          <a-tooltip placement="right">
            <a-icon type="info-circle"/>
            <template slot="title">
              服务ID: {{ text }}
            </template>
          </a-tooltip>
        </template>
        <template slot="Image" slot-scope="text, record">
          {{ record['Spec']['TaskTemplate']['ContainerSpec']['Image'] | formatImage }}
        </template>
        <template slot="Mode" slot-scope="text, record">
          {{ record['Spec']['Replicas'] }}
          <template v-if="record['Spec']['Mode']['Global'] !== null">
            全局(<code>{{ getRunningTasks(record['ID'], 'Global') }}</code> / <code>{{ getAvailableNodes() }}</code>)
          </template>
          <template v-else-if="record['Spec']['Mode']['Replicated']">
            副本(<code>{{ getRunningTasks(record['ID'], 'Replicated') }}</code> / <code>{{ record['Spec']['Mode']['Replicated']['Replicas'] }}</code>)
            <a-popconfirm okText="是"
                          cancelText="否">
              <template slot="title">
                是否要进行弹性扩展调度任务？<br>
                <a-input-number size="small"
                                :min="1"
                                :max="10"
                                :autoFocus="true"
                                :defaultValue="record['Spec']['Mode']['Replicated']['Replicas']"/>
              </template>
              <a-button type="link" icon="arrows-alt">弹性扩展</a-button>
            </a-popconfirm>
          </template>
        </template>
        <template slot="CreatedAt" slot-scope="text">
          {{ text | moment }}
        </template>
        <template slot="UpdatedAt" slot-scope="text">
          {{ text | moment }}
        </template>
        <template slot="expandedRowRender" slot-scope="text">
          {{ text['Id'] }}
          <s-table rowKey="key"
                   size="middle"
                   :columns="taskColumns"
                   :data="loadTasks">
            <template slot="Status" slot-scope="text, record">
              <template>
                <a-tag :color="taskState[record['Status']['State']]['color']">
                  {{ taskState[record['Status']['State']]['alias'] }}
                </a-tag>
                <a-tooltip v-if="['failed', 'rejected'].includes(record['Status']['State'])" placement="right">
                  <a-icon type="info-circle"/>
                  <template slot="title">
                    调度异常信息: {{ record['Status'][taskState[record['Status']['State']]['tip']] }}
                  </template>
                </a-tooltip>
              </template>
            </template>
            <template slot="Mode" slot-scope="text, record">
              {{ record['Spec']['Mode'] }}
            </template>
            <template slot="UpdatedAt" slot-scope="text">
              {{ text | moment }}
            </template>
            <template slot="action" slot-scope="text, record">
              <a @click="logs(record.Id)">日志</a>
              <a-divider type="vertical"/>
              <a @click="inspect(record.Id)">摘要</a>
              <a-divider v-if="record['Status']['State'] === 'running'" type="vertical"/>
              <a v-if="record['Status']['State'] === 'running'" @click="monitor(record.Id)">监控</a>
              <a-divider v-if="record['Status']['State'] === 'running'" type="vertical"/>
              <a v-if="record['Status']['State'] === 'running'" @click="terminal(record.Id)">终端</a>
            </template>
          </s-table>
        </template>
      </s-table>
    </a-card>
  </page-view>
</template>

<script>
  import { PageView } from '@/layouts'
  import { STable } from '@/components'
  import { invokeApi } from '@api/http'

  export default {
    name: 'ServicesList',
    components: {
      PageView,
      STable
    },
    data() {
      return {
        queryParam: [],
        serviceTask: [],
        columns: [
          {
            title: '服务名称/ID',
            dataIndex: 'ID',
            sorter: true,
            scopedSlots: { customRender: 'ID' }
          },
          {
            title: '镜像',
            dataIndex: 'Image',
            sorter: true,
            scopedSlots: { customRender: 'Image' }
          },
          {
            title: '调度模式',
            dataIndex: 'Mode',
            sorter: true,
            scopedSlots: { customRender: 'Mode' }
          },
          {
            title: '创建时间',
            dataIndex: 'CreatedAt',
            sorter: true,
            scopedSlots: { customRender: 'CreatedAt' }
          },
          {
            title: '更新时间',
            dataIndex: 'UpdatedAt',
            sorter: true,
            scopedSlots: { customRender: 'UpdatedAt' }
          }
        ],
        taskColumns: [
          {
            title: '状态',
            dataIndex: 'Status',
            sorter: true,
            scopedSlots: { customRender: 'Status' }
          },
          {
            title: '调度任务ID',
            dataIndex: 'ID',
            sorter: true,
            scopedSlots: { customRender: 'ID' }
          },
          {
            title: '插槽号',
            dataIndex: 'Slot',
            sorter: true,
            scopedSlots: { customRender: 'Slot' }
          },
          {
            title: '集群调度节点',
            dataIndex: 'NodeID',
            sorter: true,
            scopedSlots: { customRender: 'NodeID' }
          },
          {
            title: '更新时间',
            dataIndex: 'UpdatedAt',
            sorter: true,
            scopedSlots: { customRender: 'UpdatedAt' }
          },
          {
            title: '操作',
            dataIndex: 'action',
            width: 180,
            scopedSlots: { customRender: 'action' }
          }
        ],
        taskState: {
          failed: { alias: '任务调度失败', color: '#f50', tip: 'Err' },
          rejected: { alias: '任务调度被拒绝', color: '#f50', tip: 'Err' },
          running: { alias: '任务运行中', color: '#87d068', tip: '' },
          complete: { alias: '任务调度完成', color: '#108ee9', tip: '' },
          shutdown: { alias: '任务已关闭', color: '#f50', tip: '' }
        },
        selectedRowKeys: [],
        selectedRows: [],
        expandedRow: {},

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
        },
        runningTasks: 0,
        globalRunningTasks: 0,
        availableNodes: 0
      }
    },
    filters: {
      formatImage(image) {
        return image.substring(0, image.indexOf('@sha256'))
      }
    },
    methods: {
      terminal(containerId) {
        console.log(containerId)
      },
      monitor(containerId) {
        console.log(containerId)
      },
      logs(taskId) {
        console.log(taskId)
      },
      inspect(taskId) {
        console.log(taskId)
      },
      loadServices(params) {
        return invokeApi('/service/list', { ...params, ...this.queryParam }).then(response => {
          if (response.code === 2000) {
            return response.data
          } else {
            this.$notification.error({
              message: '标题',
              description: '加载数据失败'
            })
          }
        })
      },
      loadTasks(params) {
        if (params !== null) {
          params['groupBy'] = true
          params['serviceId'] = this.expandedRow['ID']
        } else {
          params = { pageSize: 9999 }
        }
        return invokeApi('/task/list', params).then(response => {
          if (response.code === 2000) {
            return response.data
          } else {
            this.$notification.error({
              message: '标题',
              description: '加载数据失败'
            })
          }
        })
      },
      loadNodes() {
        return invokeApi('/node/list', {}).then(response => {
          if (response.code === 2000) {
            return response.data
          }
        })
      },
      expandedChanged(expand, record) {
        if (expand) {
          this.expandedRow = record
        }
      },
      getRunningTasks(serviceId, mode) {
        this.loadTasks(null).then(response => {
          const runningTasks = response.data.filter(item =>
            item['Status']['State'] === 'running' &&
            item['DesiredState'] === 'running' &&
            item['ServiceID'] === serviceId
          )
          if (mode === 'Global') {
            this.globalRunningTasks = runningTasks.length
          } else {
            this.runningTasks = runningTasks.length
          }
        })
        return mode === 'Global' ? this.globalRunningTasks : this.runningTasks
      },
      getAvailableNodes() {
        this.loadNodes().then(response => {
          this.availableNodes = response.data.filter(item =>
            item['Spec']['Availability'] === 'active' &&
            item['Status']['State'] === 'ready'
          ).length
        })
        return this.availableNodes
      }
    }
  }
</script>

<style scoped lang="less">
</style>
