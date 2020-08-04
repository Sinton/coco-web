<template>
  <page-view>
    <a-card :title="'终端列表'" :bordered="false">
      <div slot="extra">
        <a-button-group>
          <a-button icon="table"/>
          <a-button icon="profile"/>
        </a-button-group>
      </div>
      <div class="table-operator">
        <a-button icon="reload" @click="() => $refs['endpointsRef'].refresh()">刷新</a-button>
        <a-button type="danger" icon="delete" :disabled="!selectedRows.length > 0">删除</a-button>
        <a-button type="primary" icon="plus">添加新终端</a-button>
      </div>

      <s-table ref="endpointsRef"
               rowKey="key"
               size="middle"
               :columns="columns"
               :data="loadEndpoints"
               :alert="options.alert"
               :rowSelection="options.rowSelection">
        <template slot="name" slot-scope="text, record">
          {{ text }}
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
    name: 'Endpoints',
    components: {
      PageView,
      STable
    },
    data() {
      return {
        columns: [
          {
            title: '终端名称',
            dataIndex: 'name',
            key: 'name',
            sorter: true,
            scopedSlots: { customRender: 'name' }
          },
          {
            title: '终端URL',
            dataIndex: 'url',
            key: 'url',
            sorter: true,
            scopedSlots: { customRender: 'url' }
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
    methods: {
      loadEndpoints(params) {
        params['filter'] = { all: true, dangling: false }
        return invokeApi('/endpoint/list', { ...params, ...this.queryParam }).then(response => {
          if (response.code === 2000) {
            console.log(response.data)
            return response.data
          } else {
            this.$notification.error({ message: '标题', description: '加载数据失败' })
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
