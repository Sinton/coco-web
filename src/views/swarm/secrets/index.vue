<template>
  <page-view>
    <a-card :title="'加密配置项列表'" :bordered="false">
      <s-table ref="table"
               rowKey="key"
               size="middle"
               :columns="columns"
               :data="loadSecret"
               :alert="options.alert"
               :rowSelection="options.rowSelection">
        <!-- 加密配置名称/ID -->
        <template slot="ID" slot-scope="text, record">
          <router-link :to="{ name: 'SecretDetails', params: { secretId: text } }">
            {{ record['Spec']['Name'] }}
          </router-link>
          <a-tooltip placement="right">
            <template slot="title">
              {{ text }}
            </template>
            <a-icon type="info-circle"/>
          </a-tooltip>
        </template>
        <!-- 创建时间 -->
        <template slot="CreatedAt" slot-scope="text">
          {{ text | moment }}
        </template>
        <!-- 更新时间 -->
        <template slot="UpdatedAt" slot-scope="text">
          {{ text | moment }}
        </template>
        <template slot="action" slot-scope="text, record">
          <span>摘要</span>
          <a-divider type="vertical"/>
          <span>删除</span>
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
    name: 'Secrets',
    components: {
      PageView,
      STable
    },
    data() {
      return {
        queryParam: [],
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
        },
        columns: [
          {
            title: '加密配置名称/ID',
            dataIndex: 'ID',
            sorter: true,
            scopedSlots: { customRender: 'ID' }
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
          },
          {
            title: '操作',
            dataIndex: 'action',
            width: 200,
            scopedSlots: { customRender: 'action' },
            fixed: 'right'
          }
        ]
      }
    },
    methods: {
      loadSecret(params) {
        return invokeApi('/secret/list', { ...params, ...this.queryParam }).then(response => {
          if (response.code === 2000) {
            return response.data
          } else {
            this.$notification.error({
              message: '标题',
              description: '加载数据失败'
            })
          }
        })
      }
    }
  }
</script>

<style scoped lang="less">
</style>
