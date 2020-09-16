<template>
  <a-card :bordered="false" style="margin-bottom: 20px;">
    <template slot="title"><a-icon type="bars"/> 重启策略</template>
    <a-list size="small" :dataSource="restartPolicy">
      <a-list-item slot="renderItem" slot-scope="item">
        <a-col span="4">{{ item.label }}</a-col>
        <a-col span="6">
          <template v-if="item.prop === 'restartCondition'">
            <a-select :default-value="item.value" style="width: 200px;">
              <a-select-option value="none">None</a-select-option>
              <a-select-option value="on-failure">On failure</a-select-option>
              <a-select-option value="any">Any</a-select-option>
            </a-select>
          </template>
          <template v-else-if="item.prop === 'restartDelay' || item.prop === 'restartWindow'">
            <a-input v-model="item.value" style="width: 200px;"/>
          </template>
          <template v-else>
            <a-input-number v-model="item.value" :min="0" style="width: 200px;"/>
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
          <a-button type="primary" icon="check" size="small" :disabled="!changed">应用变更</a-button>
          <a-dropdown :disabled="!changed">
            <a-button type="default" icon="down" size="small"/>
            <a-menu slot="overlay">
              <a-menu-item>重置变更</a-menu-item>
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
        changed: false
      }
    },
    methods: {
      renderData() {
        this.restartPolicy.push(
          {
            prop: 'restartCondition',
            tips: '出发重启的条件',
            label: '重启条件',
            value: this.data['RestartCondition'] || 'any'
          },
          {
            prop: 'restartDelay',
            tips: '重启尝试的延迟时间，用数字后跟单位（ns | us | ms | s | m | h）表示。默认值为5秒',
            label: '重启延迟时间',
            value: this.data['RestartDelay'] / Math.pow(10, 9) || 5
          },
          {
            prop: 'restartMaxAttempts',
            tips: '在放弃重启之前最大尝试次数（默认值为0，表示次数无限制）',
            label: '重启最大尝试次数',
            value: this.data['RestartMaxAttempts'] || 0
          },
          {
            prop: 'restartWindow',
            tips: '重启尝试的时间间隔窗口，间隔时间由数字后跟单位（ns | us | ms | s | m | h）表示。默认值为0秒，无限制',
            label: '重启窗口',
            value: this.data['RestartWindow'] || 0
          }
        )
      }
    },
    watch: {
      data: {
        deep: true,
        immediate: true,
        handler() {
          if (Object.keys(this.data).length > 0) {
            this.restartPolicy = []
            this.renderData()
          }
        }
      }
    }
  }
</script>

<style scoped lang="less">
</style>
