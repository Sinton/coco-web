<template>
  <a-list size="small" :dataSource="updateConfig">
    <a-list-item slot="renderItem" slot-scope="item">
      <a-col span="4">{{ item.label }}</a-col>
      <a-col span="6">
        <template v-if="item.prop === 'parallelism'">
          <a-input-number v-model="data[item.prop]" :min="1" style="width: 240px;"/>
        </template>
        <template v-else-if="item.prop === 'delay'">
          <a-input v-model="data[item.prop]" style="width: 240px;"/>
        </template>
        <template v-else>
          <a-radio-group v-model="data[item.prop]"
                         :options="failureAction"
                         :default-value="item.value"/>
        </template>
      </a-col>
      <a-col span="13" offset="1">
        <a-alert type="info" :message="item.tips" :banner="true"/>
      </a-col>
    </a-list-item>
  </a-list>
</template>

<script>
  import { isNotEmpty } from '@/utils/util'

  export default {
    name: 'CommonServiceUpdateConfig',
    props: {
      data: {
        type: Object,
        default: () => {
          return {
            parallelism: 1,
            delay: '0s',
            failureAction: 'pause'
          }
        }
      },
      reset: {
        type: Boolean,
        default: () => false
      }
    },
    data() {
      return {
        failureAction: [
          { label: '继续', value: 'continue' },
          { label: '暂停', value: 'pause' }
        ],
        updateConfig: [],
        update: false
      }
    },
    methods: {
      renderData() {
        this.updateConfig = []
        this.updateConfig.push(
          {
            prop: 'parallelism',
            tips: '同时更新的最大任务数（为0表示一次更新全部）。默认为1',
            label: '调度并行',
            value: this.data['parallelism']
          },
          {
            prop: 'delay',
            tips: '多个更新动作之间的延迟执行时间，时间单位（ns | us | ms | s | m | h）表示。默认值为0秒，不延迟',
            label: '更新延迟时间',
            value: this.data['delay']
          },
          {
            prop: 'failureAction',
            tips: '更新后无法启动时采取动作',
            label: '更新失败执行动作',
            value: this.data['failureAction']
          }
        )
      }
    },
    watch: {
      data: {
        deep: true,
        immediate: true,
        handler() {
          if (this.initialized) {
            this.renderData()
            if (this.update && !this.reset) {
              this.$emit('changed')
            }
            if (this.update && this.reset) {
              this.$emit('reset-after')
            }
            this.update = true
          }
        }
      }
    },
    computed: {
      initialized() {
        return (isNotEmpty(this.data) && isNotEmpty(this.data['failureAction']))
      }
    },
    deactivated() {
      this.update = false
    }
  }
</script>

<style scoped lang="less">
</style>
