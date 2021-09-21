<template>
  <a-card :bordered="false" style="margin-bottom: 20px;">
    <template slot="title"><a-icon type="bars"/> 更新配置</template>
    <common-service-update-config :data="updateConfig"
                                  :reset="reset"
                                  @changed="() => this.changed = true"
                                  @reset-after="() => this.reset = false"/>
    <div style="text-align: right;">
      <a style="float:left;">
        <a-button-group>
          <a-button type="primary" icon="check" size="small" :disabled="!changed" @click="onApply">应用变更</a-button>
          <a-dropdown :disabled="!changed">
            <a-button type="default" icon="down" size="small"/>
            <a-menu slot="overlay">
              <a-menu-item @click="onReset">重置变更</a-menu-item>
            </a-menu>
          </a-dropdown>
        </a-button-group>
      </a>
    </div>
  </a-card>
</template>

<script>
  import CommonServiceUpdateConfig from '@/views/swarm/services/common/updateConfig'
  import { timeSecondFormat, isNotEmpty, cloneDeep, isNumber } from '@/utils/util'
  import { invokeApi } from '@api/http'

  export default {
    name: 'DetailsServiceUpdateConfig',
    components: {
      CommonServiceUpdateConfig
    },
    props: {
      id: {
        type: String,
        default: () => ''
      },
      data: {
        type: Object,
        default: () => {}
      }
    },
    data() {
      return {
        updateConfig: {},
        originalUpdateConfig: {},
        changed: false,
        reset: false
      }
    },
    methods: {
      onApply() {
        const params = { serviceId: this.id }
        params['updateConfig'] = this.updateConfig
        invokeApi('/service/update', params).then(response => {
          if (response.code === 2000) {
            this.changed = false
            this.reset = false
            this.$notification.success({ message: '标题', description: '更新服务配置成功' })
            this.$router.go(0)
          } else {
            this.$notification.warning({ message: '标题', description: '更新服务配置失败' })
          }
        })
      },
      onReset() {
        this.changed = false
        this.reset = true
        this.updateConfig = cloneDeep(this.originalUpdateConfig)
      }
    },
    watch: {
      data: {
        deep: true,
        immediate: true,
        handler() {
          if (this.initialized) {
            this.updateConfig = {
              parallelism: isNumber(this.data['Parallelism']) ? this.data['Parallelism'] : 1,
              delay: isNumber(this.data['Delay']) ? timeSecondFormat(this.data['Delay']) : '0s',
              failureAction: this.data['FailureAction']
            }
            if (!this.changed) {
              this.originalUpdateConfig = cloneDeep(this.updateConfig)
            }
          }
        }
      }
    },
    computed: {
      initialized() {
        return (isNotEmpty(this.data) && isNotEmpty(this.data['FailureAction']))
      }
    },
    deactivated() {
      this.changed = false
      this.reset = false
    }
  }
</script>

<style scoped lang="less">
</style>
