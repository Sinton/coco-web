<template>
  <a-list size="small" :dataSource="restartPolicy">
    <a-list-item slot="renderItem" slot-scope="item">
      <a-col span="4">{{ item.label }}</a-col>
      <a-col span="6">
        <template v-if="item.prop === 'condition'">
          <a-select v-model="data[item.prop]" :default-value="item.value" style="width: 240px;">
            <a-select-option value="none">None</a-select-option>
            <a-select-option value="on-failure">On failure</a-select-option>
            <a-select-option value="any">Any</a-select-option>
          </a-select>
        </template>
        <template v-else-if="item.prop === 'delay' || item.prop === 'window'">
          <a-input v-model="data[item.prop]" style="width: 240px;"/>
        </template>
        <template v-else>
          <a-input-number v-model="data[item.prop]" :min="0" style="width: 240px;"/>
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
    name: 'CommonServiceRestartPolicy',
    props: {
      data: {
        type: Object,
        default: () => {
          return {
            condition: 'any',
            delay: '5s',
            maxAttempts: 0,
            window: '0s'
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
        restartPolicy: [],
        update: false
      }
    },
    methods: {
      renderData() {
        this.restartPolicy = []
        this.restartPolicy.push(
          {
            prop: 'condition',
            tips: '触发重启的条件',
            label: '重启条件',
            value: this.data['condition']
          },
          {
            prop: 'delay',
            tips: '重启尝试的延迟时间，时间单位（ns | us | ms | s | m | h）表示。默认值为5秒',
            label: '重启延迟时间',
            value: this.data['delay']
          },
          {
            prop: 'maxAttempts',
            tips: '在放弃重启之前最大尝试次数（默认值为0，表示次数无限制）',
            label: '重启最大尝试次数',
            value: this.data['maxAttempts']
          },
          {
            prop: 'window',
            tips: '重启尝试的时间间隔窗口，时间单位（ns | us | ms | s | m | h）表示。默认值为0秒，无限制',
            label: '重启窗口时间',
            value: this.data['window']
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
        return (isNotEmpty(this.data) && isNotEmpty(this.data['condition']))
      }
    },
    deactivated() {
      this.update = false
    }
  }
</script>

<style scoped lang="less">
</style>
