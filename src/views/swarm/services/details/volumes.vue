<template>
  <a-card :bordered="false" style="margin-bottom: 20px;" class="compact">
    <template slot="title"><a-icon type="bars"/> 存储卷</template>
    <common-service-volumes :data="volumes" @changed="() => this.changed = true">
      <a-button-group slot="applyOperation">
        <a-button type="primary" icon="check" size="small" :disabled="!changed" @click="onApply">应用变更</a-button>
        <a-dropdown :disabled="!changed">
          <a-button type="default" icon="down" size="small"/>
          <a-menu slot="overlay">
            <a-menu-item @click="onReset">重置变更</a-menu-item>
          </a-menu>
        </a-dropdown>
      </a-button-group>
    </common-service-volumes>
  </a-card>
</template>

<script>
  import CommonServiceVolumes from '@/views/swarm/services/common/volumes'
  import { cloneDeep, isNotEmpty } from '@/utils/util'
  import { invokeApi } from '@api/http'

  export default {
    name: 'DetailsServiceServiceVolumes',
    components: {
      CommonServiceVolumes
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
        volumes: [],
        originalVolumes: [],
        changed: false
      }
    },
    methods: {
      renderData() {
        this.data.forEach(item => {
          const record = {
            volumeType: item['Type'],
            source: item['Source'],
            containerPath: item['Target'],
            readOnly: item['ReadOnly'] || false
          }
          record['editor'] = cloneDeep(record)
          record['editable'] = false
          this.volumes.push(record)
        })
        this.originalVolumes = cloneDeep(this.volumes)
      },
      onApply() {
        const params = { serviceId: this.id }
        params['volumes'] = this.volumes
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
        this.volumes = cloneDeep(this.originalVolumes)
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
