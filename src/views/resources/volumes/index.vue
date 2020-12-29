<template>
  <page-view>
    <a-card :title="'挂载卷列表'" :bordered="false">
      <div class="table-operator">
        <a-button icon="reload" @click="() => $refs['volumesRef'].refresh()">刷新</a-button>
        <a-button type="danger" icon="delete" :disabled="!selectedRows.length > 0">删除</a-button>
        <a-button type="primary" icon="plus">创建挂载卷</a-button>
      </div>
      <s-table ref="volumesRef"
               :rowKey="record => record['Name']"
               size="middle"
               :columns="volumesOption.columns"
               :data="loadVolumes"
               :alert="options.alert"
               :rowSelection="options.rowSelection">
        <template slot="Name" slot-scope="text">
          <router-link :to="{ path: `volumes/${text}`, params: { volumeName: text } }">
            {{ text | truncate(40) }}
          </router-link>
        </template>
        <template slot="Stack" slot-scope="text, record">{{ record['Labels'] | stackName }}</template>
        <template slot="Mountpoint" slot-scope="text">{{ text | truncatelr }}</template>
        <template slot="CreatedAt" slot-scope="text">{{ text | moment }}</template>
      </s-table>
    </a-card>
  </page-view>
</template>

<script>
  import { PageView } from '@/layouts'
  import { STable } from '@/components'
  import { invokeApi } from '@api/http'

  export default {
    name: 'VolumesList',
    components: {
      PageView,
      STable
    },
    data() {
      return {
        queryParam: [],
        volumesOption: {
          columns: [
            {
              title: '挂载卷名称',
              dataIndex: 'Name',
              sorter: true,
              scopedSlots: { customRender: 'Name' }
            },
            {
              title: '应用栈',
              dataIndex: 'Stack',
              sorter: true,
              scopedSlots: { customRender: 'Stack' }
            },
            {
              title: '挂载卷驱动',
              dataIndex: 'Driver',
              sorter: true,
              scopedSlots: { customRender: 'Driver' }
            },
            {
              title: '宿主机挂载点',
              dataIndex: 'Mountpoint',
              sorter: true,
              scopedSlots: { customRender: 'Mountpoint' }
            },
            {
              title: '创建时间',
              dataIndex: 'CreatedAt',
              sorter: true,
              scopedSlots: { customRender: 'CreatedAt' }
            }
          ],
          data: []
        },
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
    filters: {
      stackName(label) {
        let stack = '-'
        if (label && label['com.docker.compose.project']) {
          stack = label['com.docker.compose.project']
        } else if (label && label['com.docker.stack.namespace']) {
          stack = label['com.docker.stack.namespace']
        }
        return stack
      }
    },
    methods: {
      loadVolumes(params) {
        return invokeApi('/volume/list', { ...params, ...this.queryParam }).then(response => {
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
      onSelectChange(selectedRowKeys, selectedRows) {
        this.selectedRowKeys = selectedRowKeys
        this.selectedRows = selectedRows
      }
    }
  }
</script>

<style scoped lang="less">
</style>
