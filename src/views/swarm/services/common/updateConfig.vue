<template>
  <a-list size="small" :dataSource="updateConfig">
    <a-list-item slot="renderItem" slot-scope="item">
      <a-col span="4">{{ item.label }}</a-col>
      <a-col span="6">
        <template v-if="item.prop === 'parallelism'">
          <a-input-number v-model="item.value" :min="1" @change="change" style="width: 240px;"/>
        </template>
        <template v-else-if="item.prop === 'delay'">
          <a-input v-model="item.value" @change="change" style="width: 240px;"/>
        </template>
        <template v-else>
          <a-radio-group v-model="item.value"
                         :options="[{label: '继续', value: 'continue'}, {label: '暂停', value: 'pause'}]"
                         :default-value="'pause'"
                         @change="change" />
        </template>
      </a-col>
      <a-col span="13" offset="1">
        <a-alert type="info" :message="item.tips" :banner="true"/>
      </a-col>
    </a-list-item>
  </a-list>
</template>

<script>
  export default {
    name: 'CommonServiceUpdateConfig',
    props: {
      data: {
        type: Object,
        default: () => {}
      }
    },
    data() {
      return {
        updateConfig: [],
        changed: false
      }
    },
    methods: {
      change() {
        this.changed = true
        this.$emit('changed', this.changed)
      },
      renderData() {
        this.updateConfig = []
        this.updateConfig.push(
          {
            prop: 'parallelism',
            tips: '同时更新的最大任务数（为0表示一次更新全部）。默认为1',
            label: '调度并行',
            value: _.isEmpty(this.data) ? 1 : _.isEmpty(this.data['Parallelism']) ? 1 : this.data['Parallelism']
          },
          {
            prop: 'delay',
            tips: '多个更新动作之间的延迟执行时间，时间单位（ns | us | ms | s | m | h）表示。默认值为0秒，不延迟',
            label: '更新延迟时间',
            value: _.isEmpty(this.data) ? 0 : _.isEmpty(this.data['Delay']) ? 0 : this.data['Delay']
          },
          {
            prop: 'failureAction',
            tips: '更新后无法启动时采取动作',
            label: '更新失败执行动作',
            value: _.isEmpty(this.data) ? 'pause' : _.isEmpty(this.data['FailureAction']) ? 'pause' : this.data['FailureAction']
          }
        )
      }
    },
    watch: {
      data: {
        deep: true,
        immediate: true,
        handler() {
          this.renderData()
        }
      }
    }
  }
</script>

<style scoped lang="less">
</style>
