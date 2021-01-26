<template>
  <a-card :bordered="false" class="compact">
    <template slot="title"><a-icon type="bars"/> 任务详情</template>
    <s-table rowKey="key"
             size="middle"
             :columns="columns"
             :data="loadTasks"
             :showPagination="false"
             :alert="null"
             :rowSelection="null">
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
  </a-card>
</template>

<script>
  import { STable } from '@/components'
  import { invokeApi } from '@api/http'

  export default {
    name: 'ServiceTasks',
    components: {
      STable
    },
    props: {
      serviceId: {
        type: String,
        default: null
      }
    },
    data() {
      return {
        columns: [
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
          shutdown: { alias: '任务已关闭', color: '#f50', tip: '' },
          preparing: { alias: '任务调度准备中', color: '#2db7f5', tip: '' }
        }
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
      loadTasks(params) {
        params['serviceId'] = this.serviceId
        params['groupBy'] = true
        return invokeApi('/task/list', params).then(response => {
          if (response.code === 2000) {
            return response.data
          } else {
            this.$notification.error({ message: '标题', description: '加载数据失败' })
          }
        })
      }
    }
  }
</script>

<style scoped lang="less">
</style>
