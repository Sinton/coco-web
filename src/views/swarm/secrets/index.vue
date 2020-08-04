<template>
  <page-view>
    <a-card :title="'加密配置项列表'" :bordered="false">
      <div class="table-operator">
        <a-button icon="reload" @click="() => $refs['configsRef'].refresh()">刷新</a-button>
        <a-button type="danger" icon="delete" :disabled="!selectedRows.length > 0" @click="removeSecret">删除</a-button>
        <a-button type="primary" icon="plus">添加新密钥配置</a-button>
      </div>
      <s-table ref="secretsRef"
               rowKey="key"
               size="middle"
               :columns="columns"
               :data="loadSecrets"
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
        queryParam: {},
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
      removeSecret() {
        this.selectedRows.forEach(item => {
          const params = {
            secretId: item.ID
          }
          invokeApi('/secret/remove', params).then(response => {
            if (response.code === 2000) {
              this.selectedRows = []
              this.selectedRowKeys = []
              this.$refs['secretsRef'].selectedRows = this.selectedRows
              this.$refs['secretsRef'].selectedRowKeys = this.selectedRowKeys
              this.$notification.success({ message: '提示', description: response.data })
            } else {
              this.$notification.error({ message: '提示', description: response.data })
            }
          }).catch(() => {
            this.$notification.error({ message: '错误', description: '请求接口异常' })
          }).finally(() => {
            this.$refs['secretsRef'].refresh()
          })
        })
      },
      loadSecrets(params) {
        return invokeApi('/secret/list', { ...params, ...this.queryParam }).then(response => {
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
