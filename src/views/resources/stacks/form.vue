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
        </a-col>
      </a-row>
    </a-form>
    <coco-topic>环境变量配置</coco-topic>
    <a-divider/>
    <a-table :columns="columns"
             :rowKey="record => record['name']"
             :dataSource="envs"
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
          新增环境变量配置
        </a>
      </div>
    </a-table>

    <div :style="{position: 'absolute', right: 0, bottom: 0, width: '100%', borderTop: '1px solid #e9e9e9', padding: '10px 16px', background: '#fff', textAlign: 'right',zIndex: 1}">
      <a-button :style="{ marginRight: '8px' }" @click="onClose">取消</a-button>
      <a-button type="primary" @click="deployStack">提交</a-button>
    </div>
  </a-drawer>
</template>

<script>
  import { CocoTopic } from '@/components/Coco'

  export default {
    name: 'StackForm',
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
        envs: []
      }
    },
    methods: {
      onClose() {
        this.$emit('on-close')
      },
      deployStack() {},
      append() {
        const record = {}
        record['editor'] = _.cloneDeep(record)
        record.editable = true
        this.envs.push(record)
      },
      save(record) {
        record = Object.assign(record, record['editor'])
        record.editable = false
      },
      remove(record) {
        const index = this.envs.indexOf(record)
        this.envs.splice(index, 1)
      }
    }
  }
</script>

<style scoped lang="less">
</style>
