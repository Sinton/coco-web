<template>
  <page-view>
    <a-card :title="'应用栈列表'" :bordered="false">
      <div class="table-operator">
        <a-button icon="reload" @click="() => $refs['stacksRef'].refresh()">刷新</a-button>
        <a-button type="danger" icon="delete" :disabled="!selectedRows.length > 0">删除</a-button>
        <a-button type="primary" icon="plus">创建应用栈</a-button>
      </div>
      <s-table ref="stacksRef"
               rowKey="key"
               size="middle"
               :columns="stackOption.columns"
               :data="loadStacks"
               :alert="options.alert"
               :rowSelection="options.rowSelection">
        <template slot="Type" slot-scope="text">
          {{ text === 1 ? 'Swarm' : 'Compose' }}
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
    name: 'StacksList',
    components: {
      PageView,
      STable
    },
    data() {
      return {
        queryParam: [],
        stackOption: {
          columns: [
            {
              title: '应用栈名称',
              dataIndex: 'Name',
              sorter: true,
              scopedSlots: { customRender: 'Name' },
              ellipsis: true
            },
            {
              title: '应用栈类型',
              dataIndex: 'Type',
              sorter: true,
              scopedSlots: { customRender: 'Type' },
              ellipsis: true
            },
            {
              title: '操作',
              dataIndex: 'action',
              width: 230,
              scopedSlots: { customRender: 'action' }
            }
          ],
          data: null
        },
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
    methods: {
      loadStacks(params) {
        return invokeApi('/stack/list', { ...params, ...this.queryParam }).then(response => {
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
