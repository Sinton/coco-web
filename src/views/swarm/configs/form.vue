<template>
  <a-drawer :title="'新增配置项'"
            :visible="visible"
            :width="730"
            :mask-closable="false"
            @close="onClose">
    <a-form :form="form">
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="配置项名称" v-bind="formItemLayout">
            <a-input v-decorator="['name',{rules: [{ required: true, message: '请输入配置项名称' }]}]"
                     :allow-clear="true"
                     placeholder="例如：nginx.conf"/>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>

    <coco-topic>配置项内容</coco-topic>
    <a-divider/>
    <coco-code-mirror :code="configContent" :options="cmOptions" @input="code => this.configContent = code"/>

    <coco-topic style="margin-top: 20px">标签配置</coco-topic>
    <a-divider/>
    <a-table :columns="labelColumns"
             :rowKey="record => record['name']"
             :dataSource="labels"
             :pagination="false"
             :scroll="{y: 200}"
             style="margin-bottom: 30px">
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
          新增配置项标签
        </a>
      </div>
    </a-table>

    <div :style="{position: 'absolute', right: 0, bottom: 0, width: '100%', borderTop: '1px solid #e9e9e9', padding: '10px 16px', background: '#fff', textAlign: 'right',zIndex: 1}">
      <a-button :style="{ marginRight: '8px' }" @click="onClose">取消</a-button>
      <a-button type="primary" @click="createConfig" :loading="creating">提交</a-button>
    </div>
  </a-drawer>
</template>

<script>
  import { CocoTopic, CocoCodeMirror } from '@/components'
  import { invokeApi } from '@/api/http'

  export default {
    name: 'ConfigForm',
    components: {
      CocoCodeMirror,
      CocoTopic
    },
    props: {
      visible: {
        type: Boolean,
        default: () => false
      },
      configId: {
        type: String,
        default: () => ''
      }
    },
    data() {
      return {
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
        form: this.$form.createForm(this),
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
        configContent: '',
        creating: false,
        creatingText: '创建',
        cmOptions: {
          mode: 'text/javascript'
        }
      }
    },
    methods: {
      loadConfig(configId) {
        const params = {
          configId: configId
        }
        invokeApi('/config/inspect', params).then(response => {
          if (response.code === 2000) {
            this.form.setFieldsValue({ name: response.data['Spec']['Name'] })

            this.configContent = decodeURIComponent(atob(response.data['Spec']['Data'])
              .split('')
              .map(char => '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2))
              .join(''))

            this.labels = []
            Object.keys(response.data['Spec']['Labels']).forEach(key => {
              const record = {
                name: key,
                value: response.data['Spec']['Labels'][key]
              }
              record['editor'] = _.cloneDeep(record)
              record.editable = false
              this.labels.push(record)
            })
          } else {
            this.$notification.warning({ message: '标题', description: response.data })
          }
        }).catch(() => {
          this.$notification.error({ message: '错误', description: '请求接口异常' })
        })
      },
      createConfig() {
        this.form.validateFields((errors, fieldsValue) => {
          const params = { ...fieldsValue }
          params['data'] = this.configContent
          const tmp = {}
          this.labels.map(item => item['editor']).forEach(labelItem => {
            tmp[labelItem['name']] = labelItem['value']
          })
          params['labels'] = tmp
          if (!errors) {
            this.creating = true
            this.creatingText = '创建中'
            invokeApi('/config/create', params).then(response => {
              if (response.code === 2000) {
                this.$notification.success({ message: '成功', description: response.data })
                this.form.resetFields()
                this.configContent = ''
                this.labels = []
                this.$emit('added')
                this.onClose()
              } else {
                this.$notification.warning({ message: '标题', description: response.data })
              }
            }).catch(() => {
              this.$notification.error({ message: '错误', description: '创建配置项发生异常' })
            }).finally(() => {
              this.creating = false
              this.creatingText = '创建'
            })
          }
        })
      },
      onClose() {
        this.$emit('on-close')
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
    watch: {
      visible: {
        deep: true,
        immediate: true,
        handler(currVisible) {
          if (currVisible && _.isEmpty(this.configId)) {
            this.form.resetFields()
            this.configContent = ''
            this.labels = []
            this.cmOptions['readOnly'] = false
          }
        }
      },
      configId: {
        deep: true,
        immediate: true,
        handler(currConfigId) {
          if (!_.isEmpty(currConfigId)) {
            this.loadConfig(currConfigId)
            this.cmOptions['readOnly'] = 'nocursor'
          }
        }
      }
    }
  }
</script>

<style scoped lang="less">
</style>
