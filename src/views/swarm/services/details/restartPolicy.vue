<template>
  <a-card :bordered="false" style="margin-bottom: 20px;">
    <template slot="title"><a-icon type="bars"/> 重启策略</template>
    <a-list size="small" :dataSource="restartPolicy">
      <a-list-item slot="renderItem" slot-scope="item">
        <a-col span="4">{{ item.label }}</a-col>
        <a-col span="6">
          <template v-if="item.prop === 'restartCondition'">
            <a-select v-model="item.value" :default-value="item.value" @change="() => this.changed = true" style="width: 240px;">
              <a-select-option value="none">None</a-select-option>
              <a-select-option value="on-failure">On failure</a-select-option>
              <a-select-option value="any">Any</a-select-option>
            </a-select>
          </template>
          <template v-else-if="item.prop === 'restartDelay' || item.prop === 'restartWindow'">
            <a-input v-model="item.value" style="width: 240px;"/>
          </template>
          <template v-else>
            <a-input-number v-model="item.value" :min="0" @change="() => this.changed = true" style="width: 240px;"/>
          </template>
        </a-col>
        <a-col span="13" offset="1">
          <a-alert type="info" :message="item.tips" :banner="true"/>
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
    name: 'ServiceRestartPolicy',
    props: {
      data: {
        type: Object,
        default: () => {}
      }
    },
    data() {
      return {
        restartPolicy: [],
        originalRestartPolicy: [],
        changed: false
      }
    },
    methods: {
      renderData() {
        this.restartPolicy = []
        this.restartPolicy.push(
          {
            prop: 'restartCondition',
            tips: '触发重启的条件',
            label: '重启条件',
            value: _.isEmpty(this.data) || _.isEmpty(this.data['RestartCondition']) ? 'any' : this.data['RestartCondition']
          },
          {
            prop: 'restartDelay',
            tips: '重启尝试的延迟时间，时间单位（ns | us | ms | s | m | h）表示。默认值为5秒',
            label: '重启延迟时间',
            value: _.isEmpty(this.data) || _.isEmpty(this.data['RestartDelay']) ? 5 : this.data['RestartDelay'] / Math.pow(10, 9)
          },
          {
            prop: 'restartMaxAttempts',
            tips: '在放弃重启之前最大尝试次数（默认值为0，表示次数无限制）',
            label: '重启最大尝试次数',
            value: _.isEmpty(this.data) || _.isEmpty(this.data['RestartMaxAttempts']) ? 0 : this.data['RestartMaxAttempts']
          },
          {
            prop: 'restartWindow',
            tips: '重启尝试的时间间隔窗口，时间单位（ns | us | ms | s | m | h）表示。默认值为0秒，无限制',
            label: '重启窗口',
            value: _.isEmpty(this.data) || _.isEmpty(this.data['RestartWindow']) ? 0 : this.data['RestartWindow']
          }
        )
        this.originalRestartPolicy = _.cloneDeep(this.restartPolicy)
      },
      apply() {
      },
      reset() {
        this.restartPolicy = _.cloneDeep(this.originalRestartPolicy)
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
