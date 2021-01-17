<template>
  <page-view>
    <a-card :title="'应用栈列表'" :bordered="false">
      <div class="table-operator">
        <a-button icon="reload" @click="() => $refs['stacksRef'].refresh()">刷新</a-button>
        <a-button type="danger" icon="delete" :disabled="!selectedRows.length > 0">删除</a-button>
        <a-button type="primary" icon="plus">创建应用栈</a-button>
      </div>
      <s-table ref="stacksRef"
               :rowKey="record => record['id']"
               size="middle"
               :columns="stackOption.columns"
               :data="loadStacks"
               :alert="options.alert"
               :rowSelection="options.rowSelection">
        <template slot="id" slot-scope="text, record">
          <a-list-item>
            <a-list-item-meta>
              <a-avatar slot="avatar" size="large" shape="square" :src="'https://www.logolynx.com/images/logolynx/b7/b769fa4ba92e48da33e691a69ca62224.png'"/>
              <a slot="title">{{ record['name'] }}</a>
            </a-list-item-meta>
          </a-list-item>
          <!--<router-link :to="{ path: `stacks/${record['id']}`, params: { stackId: record['id'] } }">
            {{ text }}
          </router-link>-->
        </template>
        <template slot="type" slot-scope="text">
          {{ text === 1 ? 'Compose' : 'Swarm' }}
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
              title: '应用栈名称/ID',
              dataIndex: 'id',
              sorter: true,
              scopedSlots: { customRender: 'id' },
              ellipsis: true
            },
            {
              title: '应用栈类型',
              dataIndex: 'type',
              sorter: true,
              scopedSlots: { customRender: 'type' },
              ellipsis: true
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
            this.$notification.warning({ message: '标题', description: '加载数据失败' })
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
