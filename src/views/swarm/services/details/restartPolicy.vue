<template>
  <a-card :bordered="false" style="margin-bottom: 20px;">
    <template slot="title"><a-icon type="bars"/> 重启策略</template>
    <common-service-restart-policy :data="restartPolicy"
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
  import CommonServiceRestartPolicy from '@/views/swarm/services/common/restartPolicy'
  import { timeSecondFormat, isNotEmpty, cloneDeep } from '@/utils/util'
  import { invokeApi } from '@api/http'

  export default {
    name: 'DetailsServiceRestartPolicy',
    components: {
      CommonServiceRestartPolicy
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
        restartPolicy: {},
        originalRestartPolicy: {},
        changed: false,
        reset: false
      }
    },
    methods: {
      onApply() {
        const params = { serviceId: this.id }
        params['restartPolicy'] = this.restartPolicy
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
        this.restartPolicy = cloneDeep(this.originalRestartPolicy)
      }
    },
    watch: {
      data: {
        deep: true,
        immediate: true,
        handler() {
          if (this.initialized) {
            this.restartPolicy = {
              condition: this.data['Condition'],
              delay: timeSecondFormat(this.data['Delay']),
              maxAttempts: this.data['MaxAttempts'],
              window: timeSecondFormat(this.data['Window'])
            }
            if (!this.changed) {
              this.originalRestartPolicy = cloneDeep(this.restartPolicy)
            }
          }
        }
      }
    },
    computed: {
      initialized() {
        return (isNotEmpty(this.data) && isNotEmpty(this.data['Condition']))
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
