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
    <common-labels :data="labels" :button-text="'新增配置项标签'" style="margin-bottom: 30px"/>

    <div :style="{position: 'absolute', right: 0, bottom: 0, width: '100%', borderTop: '1px solid #e9e9e9', padding: '10px 16px', background: '#fff', textAlign: 'right',zIndex: 1}">
      <a-button :style="{ marginRight: '8px' }" @click="onClose">取消</a-button>
      <a-button type="primary" @click="createConfig" :loading="creating">提交</a-button>
    </div>
  </a-drawer>
</template>

<script>
  import { CocoTopic, CocoCodeMirror } from '@/components'
  import CommonLabels from '@/views/swarm/common/labels'
  import { invokeApi } from '@/api/http'
  import { isEmpty, isNotEmpty, cloneDeep } from '@/utils/util'

  export default {
    name: 'ConfigForm',
    components: {
      CocoCodeMirror,
      CocoTopic,
      CommonLabels
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
        labels: [],
        configContent: '',
        creating: false,
        creatingText: '创建',
        cmOptions: {}
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
              record['editor'] = cloneDeep(record)
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
      }
    },
    watch: {
      visible: {
        deep: true,
        immediate: true,
        handler(currVisible) {
          if (currVisible && isEmpty(this.configId)) {
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
          if (isNotEmpty(currConfigId)) {
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
