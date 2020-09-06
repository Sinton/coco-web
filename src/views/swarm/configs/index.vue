<template>
  <page-view>
    <a-card :title="'配置项列表'" :bordered="false">
      <div class="table-operator">
        <a-button icon="reload" @click="() => $refs['configsRef'].refresh()">刷新</a-button>
        <a-button type="danger" icon="delete" :disabled="!selectedRows.length > 0" @click="removeConfig">删除</a-button>
        <a-button type="primary" icon="plus" @click="() => { this.configContent = ''; this.configContentVisible = true }">添加新配置</a-button>
      </div>
      <s-table ref="configsRef"
               rowKey="key"
               size="middle"
               :columns="columns"
               :data="loadConfigs"
               :alert="options.alert"
               :rowSelection="options.rowSelection">
        <!-- 加密配置名称/ID -->
        <template slot="ID" slot-scope="text, record">
          <span style="cursor: pointer; color: #40a9ff" @click="loadConfig(text)">
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
                <a-input :size="'small'" placeholder="请输入配置项名称"></a-input>
              </a-form-item>
            </template>
            <span style="cursor: pointer; color: #40a9ff">克隆</span>
          </a-popconfirm>
        </template>
      </s-table>
    </a-card>
    <a-drawer :visible="configContentVisible"
              :title="'配置项内容'"
              :width="650"
              :placement="'right'"
              :bodyStyle="{padding: 0}"
              :mask-closable="false"
              @close="() => this.configContentVisible = false">
      <a-form-item v-bind="{labelCol: {xs: { span: 24 }, sm: { span: 3 }},
                            wrapperCol: {xs: { span: 24 }, sm: { span: 20 }}}"
                   label="配置项名称">
        <a-input :size="'small'" placeholder="请输入配置项名称"></a-input>
      </a-form-item>
      <codemirror v-model="configContent" :options="cmOptions"/>
      <a-form-item v-for="(k, index) in form.getFieldValue('keys')"
                   :key="k"
                   v-bind="index === 0 ? formItemLayout : formItemLayoutWithOutLabel"
                   :label="index === 0 ? '标签' : ''"
                   :required="false">
        <a-input v-decorator="[`names[${k}]`]"
                 placeholder="passenger name"
                 style="width: 60%; margin-right: 8px"/>
        <a-icon v-if="form.getFieldValue('keys').length > 1"
                class="dynamic-delete-button"
                type="minus-circle-o"
                :disabled="form.getFieldValue('keys').length === 1"
                @click="() => remove(k)"/>
      </a-form-item>
      <a-form-item v-bind="formItemLayoutWithOutLabel">
        <a-button type="dashed" icon="plus" style="width: 60%" @click="add">
          {{ addText }}
        </a-button>
      </a-form-item>
      <div class="fixed-block">
        <a-button type="primary" @click="createConfig" :loading="creating">{{ creatingText }}</a-button>
      </div>
    </a-drawer>
  </page-view>
</template>

<script>
  import { codemirror } from 'vue-codemirror'
  import 'codemirror/lib/codemirror.css'
  import 'codemirror/mode/javascript/javascript.js'
  import 'codemirror/theme/darcula.css'
  import { PageView } from '@/layouts'
  import { STable } from '@/components'
  import { invokeApi } from '@api/http'

  let id = 0
  export default {
    name: 'ConfigsList',
    components: {
      codemirror,
      PageView,
      STable
    },
    data() {
      return {
        formItemLayout: {
          labelCol: {
            xs: { span: 24 },
            sm: { span: 4 }
          },
          wrapperCol: {
            xs: { span: 24 },
            sm: { span: 20 }
          }
        },
        formItemLayoutWithOutLabel: {
          wrapperCol: {
            xs: { span: 24, offset: 0 },
            sm: { span: 20, offset: 4 }
          }
        },
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
        configContentVisible: false,
        configContent: '',
        creating: false,
        creatingText: '创建',
        cmOptions: {
          tabSize: 4,
          smartIndent: true,
          mode: 'text/javascript',
          theme: 'darcula',
          lineNumbers: true,
          fontFamily: 'Cascadia Code'
        }
      }
    },
    methods: {
      loadConfig(configId) {
        const params = {
          configId: configId
        }
        return invokeApi('/config/inspect', params).then(response => {
          if (response.code === 2000) {
            this.configContentVisible = true
            this.configContent = decodeURIComponent(atob(response.data['Spec']['Data'])
              .split('')
              .map((char) => {
                return '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2)
              })
              .join(''))
          } else {
            this.$notification.error({ message: '标题', description: '加载数据失败' })
          }
        })
      },
      cloneConfig(configId) {
        const params = {
          configId: configId
        }
        invokeApi('/config/clone', params).then(response => {
          if (response.code === 2000) {
          } else {
            this.$notification.error({ message: '标题', description: '加载数据失败' })
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
      createConfig() {
        const params = {
          name: new Date().getTime(),
          data: this.configContent
        }
        this.creating = true
        this.creatingText = '创建中'
        invokeApi('/config/create', params).then(response => {
          if (response.code === 2000) {
            this.configContentVisible = false
          } else {
            this.$notification.error({ message: '提示', description: response.data })
          }
        }).catch(() => {
          this.$notification.error({ message: '错误', description: '请求接口异常' })
        }).finally(() => {
          this.creating = false
          this.creatingText = '创建'
          this.$refs['configsRef'].refresh()
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
              this.$notification.success({ message: '提示', description: response.data })
            } else {
              this.$notification.error({ message: '提示', description: response.data })
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
      },
      remove(k) {
        const { form } = this
        // can use data-binding to get
        const keys = form.getFieldValue('keys')
        // We need at least one passenger
        if (keys.length === 1) {
          return
        }
        // can use data-binding to set
        form.setFieldsValue({
          keys: keys.filter(key => key !== k)
        })
      },
      add() {
        const { form } = this
        // can use data-binding to get
        const keys = form.getFieldValue('keys')
        const nextKeys = keys.concat(id++)
        // can use data-binding to set
        // important! notify form to detect changes
        form.setFieldsValue({
          keys: nextKeys
        })
      }
    },
    beforeCreate() {
      this.form = this.$form.createForm(this, { name: 'dynamic_form_item' })
      this.form.getFieldDecorator('keys', { initialValue: [], preserve: true })
    }
  }
</script>

<style scoped lang="less">
  .fixed-block {
    z-index: 1;
    position: absolute;
    bottom: 0;
    width: 100%;
    border-top: 1px solid #e8e8e8;
    padding: 10px 16px;
    text-align: right;
    left: 0;
    background: #fff;
    border-radius: 0 0 4px 4px;

    .ant-btn {
      margin-right: 8px
    }
  }
</style>
