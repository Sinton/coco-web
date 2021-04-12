<template>
  <a-drawer title="新增容器网络"
            :width="730"
            :visible="visible"
            :get-container="false"
            :mask-closable="false"
            @close="onClose">
    <a-form :form="networkForm">
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="网络名称" v-bind="formItemLayout">
            <a-input v-decorator="['name',{rules: [{ required: true, message: '请输入存储卷名称' }]}]"
                     :allow-clear="true"
                     placeholder="例如：myVolume"/>
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="驱动" v-bind="formItemLayout">
            <a-select v-decorator="['driver',{rules: [{ required: true, message: '请选择驱动' }]}]"
                      :allow-clear="true"
                      placeholder="例如：local">
              <a-select-option v-for="driver in availableNetworkDriver"
                               :key="driver"
                               :value="driver">{{ driver }}</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <coco-topic>驱动配置</coco-topic>
    <a-divider/>
    <a-table :columns="optionColumns"
             :rowKey="record => record['name']"
             :dataSource="driverOpts"
             :pagination="false"
             :scroll="{y: 200}">
      <template v-for="column in optionColumns" v-if="column.scopedSlots" :slot="column.dataIndex" slot-scope="text, record">
        <div :key="column.dataIndex">
          <a-input v-if="record.editable"
                   v-model="record['editor'][column.dataIndex]"
                   style="margin: -6px 0"/>
          <template v-else>{{ text }}</template>
        </div>
      </template>
      <template slot="action" slot-scope="text, record">
        <div class="editable-row-operations">
          <span v-if="record.editable">
            <a @click="() => save(record)">保存</a>
            <a-divider type="vertical"/>
            <a @click="() => remove(record, driverOpts)">取消</a>
          </span>
          <span v-else>
            <a @click="() => record.editable = true">修改</a>
            <a-divider type="vertical"/>
            <a @click="() => remove(record, driverOpts)">移除</a>
          </span>
        </div>
      </template>
      <div slot="footer" style="text-align: right;">
        <a><a-button shape="circle"
                     type="primary"
                     icon="plus"
                     size="small"
                     style="margin-right: 5px"
                     @click="append(driverOpts)"/>
          新增网络驱动配置
        </a>
      </div>
    </a-table>
    <coco-topic style="margin-top: 20px">高级配置</coco-topic>
    <a-divider/>
    <a-tabs default-activeKey="config" style="margin-bottom: 30px">
      <a-tab-pane tab="网络配置" key="config">
        <a-form>
          <a-form-item v-bind="formItemLayout" label="子网">
            <a-input v-model="networkConfig.subnet" placeholder="例如 172.20.0.0/16"/>
          </a-form-item>
          <a-form-item v-bind="formItemLayout" label="网关">
            <a-input v-model="networkConfig.gateway" placeholder="例如 172.20.10.11"/>
          </a-form-item>
          <a-form-item v-bind="formItemLayout" label="IP范围">
            <a-input v-model="networkConfig.ipRange" placeholder="例如 172.20.10.128/25"/>
          </a-form-item>
          <a-form-item v-bind="formItemLayout" label="排除IP">
            <a-input v-model="networkConfig.excludeIPs" placeholder="例如 my-router=172.20.10.129"/>
          </a-form-item>
          <a-form-item v-bind="formItemLayout" label="限制外部网络访问">
            <a-switch v-model="networkConfig.internal" checkedChildren="开" unCheckedChildren="关" style="margin-right: 5px"/>
            <a-tooltip placement="right">
              <a-icon type="question-circle"/>
              <template slot="title">启用后...</template>
            </a-tooltip>
          </a-form-item>
          <a-form-item v-bind="formItemLayout" label="启用手动容器附件">
            <a-switch v-model="networkConfig.attachable" checkedChildren="开" unCheckedChildren="关" style="margin-right: 5px"/>
            <a-tooltip placement="right">
              <a-icon type="question-circle"/>
              <template slot="title">启用后...</template>
            </a-tooltip>
          </a-form-item>
        </a-form>
      </a-tab-pane>
      <a-tab-pane tab="标签" key="label">
        <a-table :columns="labelColumns"
                 :rowKey="record => record['name']"
                 :dataSource="labels"
                 :pagination="false"
                 :scroll="{y: 200}">
          <template v-for="column in labelColumns" v-if="column.scopedSlots" :slot="column.dataIndex" slot-scope="text, record">
            <div :key="column.dataIndex">
              <a-input v-if="record.editable"
                       v-model="record['editor'][column.dataIndex]"
                       style="margin: -6px 0"/>
              <template v-else>{{ text }}</template>
            </div>
          </template>
          <template slot="action" slot-scope="text, record">
            <div class="editable-row-operations">
              <span v-if="record.editable">
                <a @click="() => save(record)">保存</a>
                <a-divider type="vertical"/>
                <a @click="() => remove(record, labels)">取消</a>
              </span>
              <span v-else>
                <a @click="() => record.editable = true">修改</a>
                <a-divider type="vertical"/>
                <a @click="() => remove(record, labels)">移除</a>
              </span>
            </div>
          </template>
          <div slot="footer" style="text-align: right;">
            <a><a-button shape="circle"
                         type="primary"
                         icon="plus"
                         size="small"
                         style="margin-right: 5px"
                         @click="append(labels)"/>
              新增网络标签
            </a>
          </div>
        </a-table>
      </a-tab-pane>
    </a-tabs>

    <div :style="{position: 'absolute', right: 0, bottom: 0, width: '100%', borderTop: '1px solid #e9e9e9', padding: '10px 16px', background: '#fff', textAlign: 'right',zIndex: 1}">
      <a-button :style="{ marginRight: '8px' }" @click="onClose">取消</a-button>
      <a-button type="primary" @click="addNetwork">提交</a-button>
    </div>
  </a-drawer>
</template>

<script>
  import { invokeApi } from '@api/http'
  import { CocoTopic } from '@/components/Coco'

  export default {
    name: 'NetworkForm',
    components: {
      CocoTopic
    },
    props: {
      visible: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        networkForm: this.$form.createForm(this),
        formItemLayout: {
          labelCol: {
            xs: { span: 24 },
            sm: { span: 3 }
          },
          wrapperCol: {
            xs: { span: 24 },
            sm: { span: 21 }
          }
        },
        optionColumns: [
          {
            title: '配置名',
            dataIndex: 'name',
            scopedSlots: { customRender: 'name' }
          },
          {
            title: '配置值',
            dataIndex: 'value',
            scopedSlots: { customRender: 'value' }
          },
          {
            title: '操作',
            dataIndex: 'action',
            scopedSlots: { customRender: 'action' },
            width: 130
          }
        ],
        driverOpts: [],
        labelColumns: [
          {
            title: '标签名',
            dataIndex: 'name',
            scopedSlots: { customRender: 'name' }
          },
          {
            title: '标签值',
            dataIndex: 'value',
            scopedSlots: { customRender: 'value' }
          },
          {
            title: '操作',
            dataIndex: 'action',
            scopedSlots: { customRender: 'action' },
            width: 130
          }
        ],
        labels: [],
        networkConfig: {
          subnet: '',
          gateway: '',
          ipRange: '',
          excludeIPs: '',
          attachable: false,
          internal: false
        },
        availableNetworkDriver: []
      }
    },
    methods: {
      onClose() {
        this.$emit('on-close')
      },
      loadNetworkDriver() {
        invokeApi('/docker/info', {}).then(response => {
          if (response.code === 2000) {
            this.availableNetworkDriver = response.data['Plugins']['Network']
          } else {
            this.$notification.warning({ message: '标题', description: response.data })
          }
        }).catch(() => {
          this.$notification.error({ message: '错误', description: '创建存储卷发生异常' })
        })
      },
      addNetwork() {
        this.networkForm.validateFields((errors, fieldsValue) => {
          const params = { ...fieldsValue }
          const options = {}

          this.driverOpts.map(item => item['editor']).forEach(optionItem => {
            options[optionItem['name']] = optionItem['value']
          })
          params['driverOpts'] = options

          const tmp = {}
          this.labels.map(item => item['editor']).forEach(labelItem => {
            tmp[labelItem['name']] = labelItem['value']
          })
          params['labels'] = tmp
          params['networkConfig'] = this.networkConfig

          if (!errors) {
            invokeApi('/network/create', params).then(response => {
              if (response.code === 2000) {
                this.$notification.success({ message: '成功', description: response.data })
                this.networkForm.resetFields()
                this.$emit('added')
                this.onClose()
              } else {
                this.$notification.warning({ message: '标题', description: response.data })
              }
            }).catch(() => {
              this.$notification.error({ message: '错误', description: '创建存储卷发生异常' })
            })
          }
        })
      },
      append(data) {
        const record = {}
        record['editor'] = _.cloneDeep(record)
        record.editable = true
        data.push(record)
      },
      save(record) {
        record = Object.assign(record, record['editor'])
        record.editable = false
      },
      remove(record, data) {
        const index = data.indexOf(record)
        data.splice(index, 1)
      }
    },
    mounted() {
      this.loadNetworkDriver()
    }
  }
</script>

<style scoped lang="less">
</style>
