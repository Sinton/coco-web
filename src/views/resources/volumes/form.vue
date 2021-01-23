<template>
  <a-drawer title="新增存储卷"
            :width="730"
            :visible="visible"
            :get-container="false"
            @close="onClose">
    <a-form :form="volumeForm">
      <a-row :gutter="16">
        <a-col :span="24">
          <a-form-item label="存储卷名称" v-bind="formItemLayout">
            <a-input v-decorator="['name',{rules: [{ required: true, message: '请输入存储卷名称' }]}]"
                     :allow-clear="true"
                     placeholder="例如：myVolume"/>
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="驱动" v-bind="formItemLayout">
            <a-select v-decorator="['driver',{rules: [{ required: true, message: '请选择驱动' }], initialValue: 'local'}]"
                      placeholder="例如：local">
              <a-select-option value="local">local</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <coco-topic>驱动配置</coco-topic>
    <a-divider/>
    <a-table :columns="columns"
             :rowKey="record => record['name']"
             :dataSource="driverOpts"
             :pagination="false"
             :scroll="{y: 200}">
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
            <a @click="() => remove(record)">取消</a>
          </span>
          <span v-else>
            <a @click="() => record.editable = true">修改</a>
            <a-divider type="vertical"/>
            <a @click="() => remove(record)">移除</a>
          </span>
        </div>
      </template>
      <div slot="footer" style="text-align: right;">
        <a><a-button shape="circle"
                     type="primary"
                     icon="plus"
                     size="small"
                     style="margin-right: 5px"
                     @click="append"/>
          新增存储卷驱动配置
        </a>
      </div>
    </a-table>

    <div :style="{position: 'absolute', right: 0, bottom: 0, width: '100%', borderTop: '1px solid #e9e9e9', padding: '10px 16px', background: '#fff', textAlign: 'right',zIndex: 1}">
      <a-button :style="{ marginRight: '8px' }" @click="onClose">取消</a-button>
      <a-button type="primary" @click="addVolume">提交</a-button>
    </div>
  </a-drawer>
</template>

<script>
  import { invokeApi } from '@api/http'
  import { CocoTopic } from '@/components/Coco'

  export default {
    name: 'VolumeForm',
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
        volumeForm: this.$form.createForm(this),
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
        driverOpts: []
      }
    },
    methods: {
      onClose() {
        this.$emit('on-close')
      },
      addVolume() {
        this.volumeForm.validateFields((errors, fieldsValue) => {
          const params = { ...fieldsValue }
          const options = {}
          this.driverOpts.map(item => item['editor']).forEach(optionItem => {
            options[optionItem['name']] = optionItem['value']
          })
          params['driverOpts'] = options
          if (!errors) {
            invokeApi('/volume/create', params).then(response => {
              if (response.code === 2000) {
                this.$notification.success({ message: '成功', description: response.data })
                this.volumeForm.resetFields()
                this.$emit('added')
                this.onClose()
              } else {
                this.$notification.warning({ message: '标题', description: response.data })
              }
            }).catch(() => {
              this.$notification.error({ message: '标题', description: '创建存储卷发生异常' })
            })
          }
        })
      },
      append() {
        const record = {}
        record['editor'] = _.cloneDeep(record)
        record.editable = true
        this.driverOpts.push(record)
      },
      save(record) {
        record = Object.assign(record, record['editor'])
        record.editable = false
      },
      remove(record) {
        const index = this.driverOpts.indexOf(record)
        this.driverOpts.splice(index, 1)
      }
    }
  }
</script>

<style scoped lang="less">
</style>
