<template>
  <a-drawer :title="title"
            :width="730"
            :visible="visible"
            :get-container="false"
            @close="onClose">
    <a-form :form="endpointForm">
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="终端名称" v-bind="formItemLayout">
            <a-input v-decorator="['name',{rules: [{ required: true, message: '请输入终端名称' }]}]"
                     :allow-clear="true"
                     placeholder="例如：docker-prod01"/>
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="终端URL" v-bind="formItemLayout">
            <a-input v-decorator="['endpointUrl',{rules: [{ required: true, message: '请输入终端URL' }]}]"
                     :allow-clear="true"
                     placeholder="例如：10.0.0.10:2375 or mydocker.mydomain.com:2375"/>
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="IP" v-bind="formItemLayout">
            <a-input v-decorator="['publicIp',{rules: [{ required: true, message: '请输入终端IP' }]}]"
                     :allow-clear="true"
                     placeholder="例如：10.0.0.10 or mydocker.mydomain.com"/>
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="启用TLS" v-bind="formItemLayout">
            <a-switch v-decorator="['tlsEnable', {initialValue: false}]"
                      checked-children="开"
                      un-checked-children="关">
            </a-switch>
            <template v-if="endpointForm.getFieldValue('tlsEnable')">
              <a-divider orientation="left">TLS 模式</a-divider>
              <p>可以在<a href="https://docs.docker.com/engine/security/https/" target="_blank">Docker文档</a>中找到有关如何使用TLS保护Docker环境的更多信息</p>
              <a-radio-group v-model="tlsMode" default-value="cs">
                <a-radio-button value="cs">含客户端和服务器验证的TLS</a-radio-button>
                <a-radio-button value="c">仅客户端验证的TLS</a-radio-button>
                <a-radio-button value="s">仅服务器验证的TLS</a-radio-button>
                <a-radio-button value="not">仅TLS</a-radio-button>
              </a-radio-group>
              <template v-if="tlsMode !== 'not'">
                <a-divider orientation="left"><a-icon type="upload"/>TLS 必要文件</a-divider>
                <a-upload v-if="tlsMode === 'cs' || tlsMode === 'c' || tlsMode === 's'"
                          name="file"
                          :multiple="false"
                          action="#">
                  <a-button><a-icon type="upload"/>TLS CA 证书</a-button>
                </a-upload>
                <a-upload v-if="tlsMode === 'cs' || tlsMode === 'c'"
                          name="file"
                          :multiple="false"
                          action="#">
                  <a-button><a-icon type="upload"/>TLS 证书</a-button>
                </a-upload>
                <a-upload v-if="tlsMode === 'cs' || tlsMode === 's'"
                          name="file"
                          :multiple="false"
                          action="#">
                  <a-button><a-icon type="upload"/>TLS 密钥</a-button>
                </a-upload>
              </template>
            </template>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <div :style="{position: 'absolute', right: 0, bottom: 0, width: '100%', borderTop: '1px solid #e9e9e9', padding: '10px 16px', background: '#fff', textAlign: 'right',zIndex: 1}">
      <a-button :style="{ marginRight: '8px' }" @click="onClose">取消</a-button>
      <a-button type="primary" @click="saveOrUpdateEndpoint" :loading="submitting">{{ submittingText }}</a-button>
    </div>
  </a-drawer>
</template>

<script>
  import { invokeApi } from '@api/http'

  export default {
    name: 'EndpointForm',
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      operateType: {
        type: String,
        default: 'add'
      },
      data: {
        type: Object,
        default: () => {}
      }
    },
    data() {
      return {
        endpointForm: this.$form.createForm(this),
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
        tlsMode: 'cs',
        submitting: false,
        submittingText: '提交'
      }
    },
    methods: {
      saveOrUpdateEndpoint() {
        this.endpointForm.validateFields((errors, fieldsValue) => {
          if (!errors) {
            const apiTarget = this.operateType === 'add' ? 'create' : 'modify'
            const responseTip = this.operateType === 'add' ? '创建' : '修改'
            if (fieldsValue['tlsEnable']) {
              fieldsValue['tlsEnable'] = 1
            } else {
              fieldsValue['tlsEnable'] = 0
            }
            if (!_.isEmpty(this.data) && _.isNumber(this.data.id)) {
              fieldsValue = { ...fieldsValue, ...{ id: this.data.id } }
            }
            this.submitting = true
            this.submittingText = '提交中'
            invokeApi(`/endpoint/${apiTarget}`, fieldsValue).then(response => {
              if (response.code === 2000) {
                this.$notification.success({ message: '成功', description: `${responseTip}服务终端成功` })
                this.endpointForm.resetFields()
                this.$emit('submitted')
                this.onClose()
              } else {
                this.$notification.warning({ message: '标题', description: response.data })
              }
            }).catch(() => {
              this.$notification.error({ message: '标题', description: `${responseTip}服务终端发生异常` })
            }).finally(() => {
              this.submitting = false
              this.submittingText = '提交'
            })
          }
        })
      },
      onClose() {
        this.$emit('on-close')
      }
    },
    computed: {
      title() {
        return this.operateType === 'add' ? '新增服务终端' : '修改服务终端'
      }
    },
    watch: {
      visible(currVisible) {
        if (currVisible) {
          if (this.data == null) {
            this.endpointForm.resetFields()
          } else {
            this.endpointForm.setFieldsValue({
              name: this.data['name'],
              endpointUrl: this.data['endpointUrl'],
              publicIp: this.data['publicIp'],
              tlsEnable: this.data['tlsEnable'] === 1
            })
          }
        }
      }
    }
  }
</script>

<style scoped lang="less">
</style>
