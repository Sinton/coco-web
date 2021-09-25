<template>
  <a-card :bordered="false" style="margin-bottom: 20px;">
    <template slot="title"><a-icon type="bars"/> 资源限制与配额</template>
    <common-service-resources :data="resources"
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
  import CommonServiceResources from '@/views/swarm/services/common/resources'
  import { cloneDeep, convertSize, isEmpty, isNotEmpty } from '@/utils/util'
  import { invokeApi } from '@/api/http'

  export default {
    name: 'DetailsServiceResources',
    components: {
      CommonServiceResources
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
        resources: {
          memoryReservations: 0,
          memoryLimits: 0,
          cpuReservations: 0,
          cpuLimits: 0
        },
        originalResources: {
          memoryReservations: 0,
          memoryLimits: 0,
          cpuReservations: 0,
          cpuLimits: 0
        },
        changed: false,
        reset: false
      }
    },
    methods: {
      onApply() {
        const params = { serviceId: this.id }
        params['resources'] = this.resources
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
        this.resources = cloneDeep(this.originalResources)
      }
    },
    watch: {
      data: {
        deep: true,
        immediate: true,
        handler() {
          if (this.initialized) {
            this.resources = {
              memoryReservations: isEmpty(this.data['Reservations']) ? 0 : convertSize(this.data['Reservations']['MemoryBytes'], false, false, 1024),
              memoryLimits: isEmpty(this.data['Reservations']) ? 0 : convertSize(this.data['Limits']['MemoryBytes'], false, false, 1024),
              cpuReservations: this.data['Reservations']['NanoCPUs'] / Math.pow(10, 9) * 100,
              cpuLimits: this.data['Limits']['NanoCPUs'] / Math.pow(10, 9) * 100
            }
          }
          if (!this.changed) {
            this.originalResources = cloneDeep(this.resources)
          }
        }
      }
    },
    computed: {
      initialized() {
        return isNotEmpty(this.data) && isNotEmpty(this.data['Reservations'])
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
