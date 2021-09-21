<template>
  <a-card :bordered="false" style="margin-bottom: 20px;" class="compact">
    <template slot="title"><a-icon type="bars"/> 环境变量</template>
    <common-service-envs :data="envs" @changed="() => this.changed = true">
      <a-button-group slot="applyOperation">
        <a-button type="primary" icon="check" size="small" :disabled="!changed" @click="onApply">应用变更</a-button>
        <a-dropdown :disabled="!changed">
          <a-button type="default" icon="down" size="small"/>
          <a-menu slot="overlay">
            <a-menu-item @click="onReset">重置变更</a-menu-item>
          </a-menu>
        </a-dropdown>
      </a-button-group>
    </common-service-envs>
  </a-card>
</template>

<script>
  import CommonServiceEnvs from '@/views/swarm/services/common/envs'
  import { cloneDeep, isNotEmpty } from '@/utils/util'
  import { invokeApi } from '@/api/http'

  export default {
    name: 'DetailsServiceServiceEnvs',
    components: {
      CommonServiceEnvs
    },
    props: {
      id: {
        type: String,
        default: () => ''
      },
      data: {
        type: Array,
        default: () => []
      }
    },
    data() {
      return {
        envs: [],
        originalEnvs: [],
        changed: false
      }
    },
    methods: {
      renderData() {
        this.data.forEach(item => {
          const record = { name: item.split('=')[0], value: item.split('=')[1] }
          record['editor'] = cloneDeep(record)
          record['editable'] = false
          record['original'] = true
          this.envs.push(record)
        })
        this.originalEnvs = cloneDeep(this.envs)
      },
      onApply() {
        const params = { serviceId: this.id }
        params['envs'] = this.envs
        invokeApi('/service/update', params).then(response => {
          if (response.code === 2000) {
            this.changed = false
            this.$notification.success({ message: '标题', description: '更新服务配置成功' })
            this.$router.go(0)
          } else {
            this.$notification.warning({ message: '标题', description: '更新服务配置失败' })
          }
        }).catch(() => {
          this.$notification.error({ message: '错误', description: '更新服务配置异常' })
        })
      },
      onReset() {
        this.changed = false
        this.envs = cloneDeep(this.originalEnvs)
      }
    },
    watch: {
      data: {
        deep: true,
        immediate: true,
        handler() {
          if (isNotEmpty(this.data)) {
            this.renderData()
          }
        }
      }
    }
  }
</script>

<style scoped lang="less">
</style>
