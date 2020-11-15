<template>
  <a-card :bordered="false" style="margin-bottom: 20px;">
    <template slot="title"><a-icon type="bars"/> 更新配置</template>
    <a-list size="small" :dataSource="updateConfig">
      <a-list-item slot="renderItem" slot-scope="item">
        <a-col span="4">{{ item.label }}</a-col>
        <a-col span="6">
          <template v-if="item.prop === 'parallelism'">
            <a-input-number v-model="item.value" :min="1" @change="() => changed = true" style="width: 240px;"/>
          </template>
          <template v-else-if="item.prop === 'delay'">
            <a-input v-model="item.value" @change="() => changed = true" style="width: 240px;"/>
          </template>
          <template v-else>
            <a-radio-group v-model="item.value" :options="[{label: '继续', value: 'continue'}, {label: '暂停', value: 'pause'}]" :default-value="'pause'" @change="() => changed = true" />
          </template>
        </a-col>
        <a-col span="14">
          <a-alert type="info" :message="item.tips" banner/>
        </a-col>
      </a-list-item>
    </a-list>
    <div style="text-align: right;">
      <a style="float:left;">
        <a-button-group>
          <a-button type="primary" icon="check" size="small" :disabled="!changed" @click="apply">应用变更</a-button>
          <a-dropdown :disabled="!changed">
            <a-button type="default" icon="down" size="small"/>
            <a-menu slot="overlay">
              <a-menu-item @click="reset">重置变更</a-menu-item>
            </a-menu>
          </a-dropdown>
        </a-button-group>
      </a>
    </div>
  </a-card>
</template>

<script>
  export default {
    name: 'ServiceUpdateConfig',
    props: {
      data: {
        type: Object,
        default: () => {}
      }
    },
    data() {
      return {
        updateConfig: [],
        originalUpdateConfig: [],
        changed: false
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
            value: _.isEmpty(this.data) || _.isEmpty(this.data['Parallelism']) ? 1 : this.data['Parallelism']
          },
          {
            prop: 'delay',
            tips: '多个更新动作之间的延迟执行时间，时间单位（ns | us | ms | s | m | h）表示。默认值为0秒，不延迟',
            label: '更新延迟时间',
            value: _.isEmpty(this.data) || _.isEmpty(this.data['Delay']) ? 0 : this.data['Delay']
          },
          {
            prop: 'failureAction',
            tips: '更新后无法启动时采取动作',
            label: '更新失败执行动作',
            value: _.isEmpty(this.data) || _.isEmpty(this.data['FailureAction']) ? 'pause' : this.data['FailureAction']
          }
        )
        this.originalUpdateConfig = _.cloneDeep(this.updateConfig)
      },
      apply() {
      },
      reset() {
        this.updateConfig = _.cloneDeep(this.originalUpdateConfig)
        this.changed = false
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
