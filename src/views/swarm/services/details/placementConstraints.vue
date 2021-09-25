<template>
  <a-card :bordered="false" style="margin-bottom: 20px;" class="compact">
    <template slot="title"><a-icon type="bars"/> 约束条件</template>
    <common-service-placement-constraints :data="constraints" @changed="() => this.changed = true">
      <a-button-group slot="applyOperation">
        <a-button type="primary" icon="check" size="small" :disabled="!changed" @click="onApply">应用变更</a-button>
        <a-dropdown :disabled="!changed">
          <a-button type="default" icon="down" size="small"/>
          <a-menu slot="overlay">
            <a-menu-item @click="onReset">重置变更</a-menu-item>
          </a-menu>
        </a-dropdown>
      </a-button-group>
    </common-service-placement-constraints>
  </a-card>
</template>

<script>
  import CommonServicePlacementConstraints from '@/views/swarm/services/common/placementConstraints'
  import { cloneDeep, isNotEmpty } from '@/utils/util'
  import { invokeApi } from '@/api/http'

  export default {
    name: 'DetailsServicePlacementConstraints',
    components: {
      CommonServicePlacementConstraints
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
        constraints: [],
        originalConstraints: [],
        changed: false
      }
    },
    methods: {
      renderData() {
        this.data.forEach(item => {
          const record = {
            name: item.split(' ')[0],
            operator: item.split(' ')[1],
            value: item.split(' ')[2]
          }
          record['editor'] = cloneDeep(record)
          record['editable'] = false
          this.constraints.push(record)
        })
        this.originalConstraints = cloneDeep(this.constraints)
      },
      onApply() {
        const params = { serviceId: this.id }
        params['constraints'] = this.constraints
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
        this.constraints = cloneDeep(this.originalConstraints)
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
