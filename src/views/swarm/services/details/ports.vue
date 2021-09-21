<template>
  <a-card :bordered="false" style="margin-bottom: 20px;" class="compact">
    <template slot="title"><a-icon type="bars"/> 端口映射</template>
    <common-service-ports :data="ports" @changed="() => this.changed = true">
      <a-button-group slot="applyOperation">
        <a-button type="primary" icon="check" size="small" :disabled="!changed" @click="onApply">应用变更</a-button>
        <a-dropdown :disabled="!changed">
          <a-button type="default" icon="down" size="small"/>
          <a-menu slot="overlay">
            <a-menu-item @click="onReset">重置变更</a-menu-item>
          </a-menu>
        </a-dropdown>
      </a-button-group>
    </common-service-ports>
  </a-card>
</template>

<script>
  import CommonServicePorts from '@/views/swarm/services/common/ports'
  import { cloneDeep, isNotEmpty } from '@/utils/util'
  import { invokeApi } from '@api/http'

  export default {
    name: 'DetailsServiceServicePorts',
    components: {
      CommonServicePorts
    },
    props: {
      data: {
        type: Array,
        default: () => []
      }
    },
    data() {
      return {
        ports: [],
        originalPorts: [],
        changed: false
      }
    },
    methods: {
      renderData() {
        this.data.forEach(item => {
          const record = {
            hostPort: item['PublishedPort'],
            containerPort: item['TargetPort'],
            protocol: item['Protocol'],
            publishMode: item['PublishMode']
          }
          record['editor'] = cloneDeep(record)
          record['editable'] = false
          this.ports.push(record)
        })
        this.originalPorts = cloneDeep(this.ports)
      },
      onApply() {
        const params = { serviceId: this.id }
        params['ports'] = this.ports
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
        this.ports = cloneDeep(this.originalPorts)
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
