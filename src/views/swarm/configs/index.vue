<template>
  <page-view>
    <a-card :title="'配置项列表'" :bordered="false">
      <div class="table-operator">
        <a-button icon="reload" @click="() => $refs['configsRef'].refresh()">刷新</a-button>
        <a-button type="danger" icon="delete" :disabled="!selectedRows.length > 0" @click="removeConfig">删除</a-button>
        <a-button type="primary" icon="plus" @click="() => { this.visible = true; this.configId = null }">添加新配置</a-button>
      </div>
      <s-table ref="configsRef"
               :rowKey="record => record['ID']"
               size="middle"
               :columns="columns"
               :data="loadConfigs"
               :alert="options.alert"
               :rowSelection="options.rowSelection">
        <!-- 加密配置名称/ID -->
        <template slot="ID" slot-scope="text, record">
          <span style="cursor: pointer; color: #40a9ff" @click="modifyConfig(text)">
            {{ record['Spec']['Name'] }}
          </span>
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
          <a-popconfirm ok-text="克隆"
                        cancel-text="取消"
                        @confirm="cloneConfig(record)">
            <template slot="title">
              <div>是否要克隆配置项?</div>
              <a-form-item v-bind="{labelCol: {xs: { span: 24 }, sm: { span: 6 }},
                                    wrapperCol: {xs: { span: 24 }, sm: { span: 18 }}}"
                           style="margin-bottom: 0"
                           label="新名称">
                <a-input v-model="cloneConfigName" :size="'small'" placeholder="请输入配置项名称"></a-input>
              </a-form-item>
            </template>
            <span style="cursor: pointer; color: #40a9ff">克隆</span>
          </a-popconfirm>
        </template>
      </s-table>
    </a-card>
    <config-form :visible="visible"
                 :config-id="configId"
                 @on-close="() => this.visible = false"
                 @added="() => this.$refs['configsRef'].refresh()"/>
  </page-view>
</template>

<script>
  import { PageView } from '@/layouts'
  import { STable } from '@/components'
  import { invokeApi } from '@api/http'
  import ConfigForm from '@/views/swarm/configs/form'

  export default {
    name: 'ConfigsList',
    components: {
      ConfigForm,
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
        },
        visible: false,
        cloneConfigName: '',
        configId: null
      }
    },
    methods: {
      modifyConfig(configId) {
        this.configId = configId
        this.visible = true
      },
      cloneConfig(config) {
        const params = {
          configId: config.ID,
          name: this.cloneConfigName
        }
        invokeApi('/config/clone', params).then(response => {
          if (response.code === 2000) {
            this.$notification.success({ message: '成功', description: response.data })
            this.$refs['configsRef'].refresh()
          } else {
            this.$notification.warning({ message: '标题', description: response.data })
          }
        }).catch(() => {
          this.$notification.error({ message: '错误', description: '请求接口异常' })
        })
      },
      loadConfigs(params) {
        return invokeApi('/config/list', { ...params, ...this.queryParam }).then(response => {
          if (response.code === 2000) {
            return response.data
          } else {
            this.$notification.warning({ message: '标题', description: '加载数据失败' })
          }
        }).catch(() => {
          this.$notification.error({ message: '错误', description: '请求接口异常' })
        })
      },
      removeConfig() {
        this.selectedRows.forEach(item => {
          const params = {
            configId: item.ID
          }
          invokeApi('/config/remove', params).then(response => {
            if (response.code === 2000) {
              this.selectedRows = []
              this.selectedRowKeys = []
              this.$refs['configsRef'].selectedRows = this.selectedRows
              this.$refs['configsRef'].selectedRowKeys = this.selectedRowKeys
              this.$notification.success({ message: '成功', description: response.data })
            } else {
              this.$notification.warning({ message: '提示', description: response.data })
            }
          }).catch(() => {
            this.$notification.error({ message: '错误', description: '请求接口异常' })
          }).finally(() => {
            this.$refs['configsRef'].refresh()
          })
        })
      },
      onSelectChange(selectedRowKeys, selectedRows) {
        this.selectedRowKeys = selectedRowKeys
        this.selectedRows = selectedRows
      }
    },
    beforeCreate() {
      this.form = this.$form.createForm(this, { name: 'dynamic_form_item' })
      this.form.getFieldDecorator('keys', { initialValue: [], preserve: true })
    }
  }
</script>

<style scoped lang="less">
</style>
