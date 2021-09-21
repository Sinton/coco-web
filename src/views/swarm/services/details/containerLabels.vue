<template>
  <a-card :bordered="false" style="margin-bottom: 20px;" class="compact">
    <template slot="title"><a-icon type="bars"/> 容器标签</template>
    <common-container-labels :data="containerLabels" @changed="() => this.changed = true">
      <a-button-group slot="applyOperation">
        <a-button type="primary" icon="check" size="small" :disabled="!changed" @click="onApply">应用变更</a-button>
        <a-dropdown :disabled="!changed">
          <a-button type="default" icon="down" size="small"/>
          <a-menu slot="overlay">
            <a-menu-item @click="onReset">重置变更</a-menu-item>
          </a-menu>
        </a-dropdown>
      </a-button-group>
    </common-container-labels>
  </a-card>
</template>

<script>
  import CommonContainerLabels from '@/views/swarm/services/common/containerLabels'
  import { invokeApi } from '@/api/http'
  import { cloneDeep } from '@/utils/util'

  export default {
    name: 'DetailsServiceContainerLabels',
    components: {
      CommonContainerLabels
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
        containerLabels: [],
        originalContainerLabels: [],
        changed: false
      }
    },
    methods: {
      renderData() {
        Object.keys(this.data).forEach(key => {
          const item = { name: key, value: this.data[key] }
          item['editor'] = cloneDeep(item)
          item['editable'] = false
          this.containerLabels.push(item)
        })
        this.originalContainerLabels = cloneDeep(this.containerLabels)
      },
      onApply() {
        const params = { serviceId: this.id }
        params['containerLabels'] = this.containerLabels
        invokeApi('/service/update', params).then(response => {
          if (response.code === 2000) {
            this.changed = false
            this.$notification.success({ message: '标题', description: '更新服务配置成功' })
            this.$router.go(0)
          } else {
            this.$notification.warning({ message: '标题', description: '更新服务配置失败' })
          }
        })
      },
      onReset() {
        this.changed = false
        this.containerLabels = cloneDeep(this.originalContainerLabels)
      }
    },
    watch: {
      data: {
        deep: true,
        immediate: true,
        handler() {
          if (Object.keys(this.data).length > 0) {
            this.renderData()
          }
        }
      }
    }
  }
</script>

<style scoped lang="less">
</style>
