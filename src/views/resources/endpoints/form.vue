<template>
  <a-drawer title="新增服务终端"
            :width="730"
            :visible="visible"
            :get-container="false"
            @close="onClose">
    <a-form :form="endpointForm">
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="终端名称" v-bind="formItemLayout">
            <a-input v-decorator="['name',{rules: [{ required: true, message: '请输入终端名称' }]}]"
                     placeholder="例如：docker-prod01"/>
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="终端URL" v-bind="formItemLayout">
            <a-input v-decorator="['url',{rules: [{ required: true, message: '请输入终端URL' }]}]"
                     placeholder="例如：10.0.0.10:2375 or mydocker.mydomain.com:2375"/>
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="IP" v-bind="formItemLayout">
            <a-input v-decorator="['ip',{rules: [{ required: true, message: '请输入终端IP' }]}]"
                     placeholder="例如：10.0.0.10 or mydocker.mydomain.com"/>
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="启用TLS" v-bind="formItemLayout">
            <a-switch v-decorator="['tls', {initialValue: false}]"
                      checked-children="开"
                      un-checked-children="关">
            </a-switch>
            <template v-if="endpointForm.getFieldValue('tls')">
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
      <a-button type="primary" @click="saveOrUpdateEndpoint">提交</a-button>
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
        tlsMode: 'cs'
      }
    },
    methods: {
      saveOrUpdateEndpoint() {
        this.endpointForm.validateFields((errors, fieldsValue) => {
          if (!errors) {
            invokeApi('/endpoint/create', fieldsValue).then(response => {
              if (response.code === 2000) {
                this.$notification.success({ message: '成功', description: '创建服务终端成功' })
                this.endpointForm.resetFields()
                this.$emit('added')
                this.onClose()
              } else {
                this.$notification.warning({ message: '标题', description: response.data })
              }
            }).catch(() => {
              this.$notification.error({ message: '标题', description: '创建服务终端发生异常' })
            })
          }
        })
      },
      onClose() {
        this.$emit('on-close')
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
              url: this.data['endpointUrl'],
              ip: this.data['publicIp'],
              tls: this.data['tlsEnable'] === 1
            })
          }
        }
      }
    }
  }
</script>

<style scoped lang="less">
</style>
