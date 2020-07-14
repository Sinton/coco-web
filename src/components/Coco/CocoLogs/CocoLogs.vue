<template>
  <a-drawer :visible="visible"
            :title="title"
            :height="height"
            :placement="'bottom'"
            :bodyStyle="{padding: 0}"
            :mask-closable="false"
            @close="() => this.$emit('close')">
    <a-row>
      <a-col span="4">
        <a-form :form="logsForm">
          <a-form-item v-bind="formItemLayout" label="自动刷新">
            <a-switch v-decorator="formItemProp['autoRefresh']"
                      checkedChildren="开"
                      unCheckedChildren="关"/>
          </a-form-item>
          <!--<a-form-item v-bind="formItemLayout" label="是否换行">
            <a-switch v-decorator="['warpLine']"
                      checkedChildren="开"
                      unCheckedChildren="关"/>
          </a-form-item>-->
          <a-form-item v-bind="formItemLayout" label="显示时间戳">
            <a-switch v-decorator="formItemProp['timestamp']"
                      checkedChildren="开"
                      unCheckedChildren="关"/>
          </a-form-item>
          <a-form-item v-bind="formItemLayout" label="截取行数">
            <a-input-number v-decorator="formItemProp['tail']"
                            :min="10"
                            :step="5"
                            placeholder="行数"/>
          </a-form-item>
          <a-form-item v-bind="formItemLayout" label="截取时间">
            <a-select v-decorator="formItemProp['timeFetch']"
                      placeholder="请输入截断时间">
              <a-select-option v-for="timeOption in timeFilter"
                               :key="timeOption.value"
                               :value="timeOption.value">
                {{ timeOption.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item v-bind="formItemLayout" label="过滤">
            <a-input v-decorator="formItemProp['filter']"
                     placeholder="请输入过滤信息"/>
          </a-form-item>
        </a-form>
      </a-col>
      <a-col span="20">
        <div style="max-height: 400px; overflow-y: auto;">
          <coco-web-terminal @write="write" ref="terminalRef"/>
        </div>
      </a-col>
    </a-row>
  </a-drawer>
</template>

<script>
  import { CocoWebTerminal } from '@/components/Coco'

  export default {
    name: 'CocoLogs',
    components: { CocoWebTerminal },
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      title: {
        type: String,
        default: ''
      },
      height: {
        type: Number,
        default: 450
      },
      logs: {
        type: Array,
        default: null
      }
    },
    data() {
      return {
        terminal: null,
        logsForm: this.$form.createForm(this),
        formItemLayout: {
          labelCol: {
            xs: { span: 8 },
            sm: { span: 8 }
          },
          wrapperCol: {
            xs: { span: 14 },
            sm: { span: 14 }
          }
        },
        formItemProp: {
          autoRefresh: ['autoRefresh', { valuePropName: 'checked', initialValue: false }],
          timestamp: ['timestamp', { valuePropName: 'checked', initialValue: false }],
          tail: ['tail', { rules: [{ required: true, message: '请输入要展示的行数' }], initialValue: 100 }],
          timeFetch: ['timeFetch', { rules: [{ required: true, message: '请输入截断时间' }], initialValue: 'all' }],
          filter: ['filter', { rules: [{ required: true, message: '请输入过滤信息' }], initialValue: '' }]
        },
        timeFilter: [
          { label: '全部', value: 'all' },
          { label: '最近一天', value: 'lastday' },
          { label: '最近4小时', value: 'last4hours' },
          { label: '最近1小时', value: 'lasthour' },
          { label: '最近10分钟', value: 'last10min' }
        ]
      }
    },
    methods: {
      write(terminal) {
        this.terminal = terminal
      }
    },
    watch: {
      logs: {
        deep: true,
        immediate: true,
        handler(currLogs) {
          if (!_.isEmpty(currLogs)) {
            this.terminal.clear()
            currLogs.forEach(log => {
              if (log.startsWith('STDOUT:')) {
                this.terminal.writeln(log)
              } else if (log.startsWith('STDERR:')) {
                this.terminal.writeln(log)
              } else {
                this.terminal.writeln(log)
              }
            })
            this.terminal.scrollToBottom()
          }
        }
      }
    }
  }
</script>

<style scoped lang="less">
</style>
