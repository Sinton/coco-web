<template>
  <a-drawer title="新增应用栈"
            :width="730"
            :visible="visible"
            :get-container="false"
            :mask-closable="false"
            @close="onClose">
    <a-form :form="stackForm">
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="应用栈名称" v-bind="formItemLayout">
            <a-input v-decorator="['name',{rules: [{ required: true, message: '请输入应用栈名称' }]}]"
                     :allow-clear="true"
                     placeholder="例如：wordpress"/>
          </a-form-item>
          <a-form-item label="应用栈类型" v-bind="formItemLayout">
            <a-radio-group v-decorator="['type',{initialValue: '1', rules: [{ required: true, message: '请选择应用栈类型' }]}]">
              <a-radio value="1">Compose</a-radio>
              <a-radio value="2">Swarm</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>

    <coco-topic>YAML文件内容配置</coco-topic>
    <a-tabs v-model="yamlType" @change="(activeKey) => this.yamlType = activeKey" default-activeKey="online">
      <a-tab-pane tab="在线编辑" key="online">
        <coco-code-mirror :code="yamlContent" :options="cmOptions" @input="code => this.yamlContent = code"/>
      </a-tab-pane>
      <a-tab-pane tab="文件上传" key="upload">
        <a-upload-dragger name="file"
                          accept=".yaml, .yml"
                          :with-credentials="true"
                          :custom-request="uploadYamlFile"
                          :show-upload-list="true"
                          :multiple="false"
                          @change="uploadChange"
                          style="display: block">
          <p class="ant-upload-drag-icon"><a-icon type="inbox"/></p>
          <p class="ant-upload-text">点击或拖拽文件到该区域进行上传</p>
          <p class="ant-upload-hint">请保证上传的YML文件符合格式要求</p>
        </a-upload-dragger>
      </a-tab-pane>
    </a-tabs>

    <coco-topic style="margin-top: 20px;">环境变量配置</coco-topic>
    <a-divider/>
    <a-table :columns="columns"
             :rowKey="record => record['name']"
             :dataSource="envs"
             :pagination="false"
             :scroll="{y: 200}"
             style="margin-bottom: 30px">
      <template v-for="column in columns" v-if="column.scopedSlots" :slot="column.dataIndex" slot-scope="text, record">
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
            <a @click="() => remove(record, envs)">取消</a>
          </span>
          <span v-else>
            <a @click="() => record.editable = true">修改</a>
            <a-divider type="vertical"/>
            <a @click="() => remove(record, envs)">移除</a>
          </span>
        </div>
      </template>
      <div slot="footer" style="text-align: right;">
        <a><a-button shape="circle"
                     type="primary"
                     icon="plus"
                     size="small"
                     style="margin-right: 5px"
                     @click="append(envs)"/>
          新增环境变量配置
        </a>
      </div>
    </a-table>

    <div :style="{position: 'absolute', right: 0, bottom: 0, width: '100%', borderTop: '1px solid #e9e9e9', padding: '10px 16px', background: '#fff', textAlign: 'right',zIndex: 1}">
      <a-button :style="{ marginRight: '8px' }" @click="onClose">取消</a-button>
      <a-button type="primary" @click="deployStack" :loading="submitting">{{ submittingText }}</a-button>
    </div>
  </a-drawer>
</template>

<script>
  import { CocoTopic } from '@/components/Coco'
  import CocoCodeMirror from '@/components/Coco/CocoCodeMirror/CocoCodeMirror'
  import { invokeApi } from '@/api/http'

  export default {
    name: 'StackForm',
    components: {
      CocoCodeMirror,
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
        stackForm: this.$form.createForm(this),
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
        columns: [
          {
            title: '环境变量名',
            dataIndex: 'name',
            scopedSlots: { customRender: 'name' }
          },
          {
            title: '环境变量值',
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
        yamlType: 'online',
        yamlContent: '',
        cmOptions: {
          mode: 'yaml'
        },
        fileUuid: '',
        envs: [],
        submitting: false,
        submittingText: '提交'
      }
    },
    methods: {
      onClose() {
        this.$emit('on-close')
      },
      deployStack() {
        this.stackForm.validateFields((errors, fieldsValue) => {
          const params = { ...fieldsValue }
          params['yamlType'] = this.yamlType
          switch (this.yamlType) {
            case 'online':
              params['content'] = this.yamlContent
              break
            case 'upload':
              params['fileUuid'] = this.fileUuid
              break
          }
          if (!errors) {
            this.submitting = true
            this.submittingText = '提交中'
            invokeApi('/stack/create', params).then(response => {
              if (response.code === 2000) {
                this.$notification.success({ message: '成功', description: response.data })
                this.stackForm.resetFields()
                this.yamlType = 'online'
                this.yamlContent = ''
                this.envs = []
                this.$emit('submitted')
                this.onClose()
              } else {
                this.$notification.warning({ message: '标题', description: response.data })
              }
            }).catch(() => {
              this.$notification.error({ message: '错误', description: '创建应用栈发生异常' })
            }).finally(() => {
              this.submitting = false
              this.submittingText = '提交'
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
      },
      uploadChange(info) {
        switch (info.file.status) {
          case 'uploading':
            break
          case 'done':
            this.$message.success(`${info.file.name} 文件上传成功.`)
            break
          case 'error':
            this.$message.error(`${info.file.name} 文件上传失败.`)
            break
        }
      },
      uploadYamlFile(options) {
        const params = new FormData()
        params.append('file', options.file)
        invokeApi('/file/upload', params).then(response => {
          if (response.code === 2000) {
            options.onSuccess(options.file)
            this.fileUuid = response.data
          } else {
            options.onError(options.file)
          }
        }).catch(() => {
          options.onError(options.file)
        })
      }
    }
  }
</script>

<style scoped lang="less">
</style>
