<template>
  <a-card :bordered="false" style="margin-bottom: 20px;" class="compact">
    <template slot="title"><a-icon type="bars"/> 加密配置项</template>
    <common-service-secrets :data="secrets" :details-mode="true" @changed="() => this.changed = true">
      <a-button-group slot="applyOperation">
        <a-button type="primary" icon="check" size="small" :disabled="!changed" @click="onApply">应用变更</a-button>
        <a-dropdown :disabled="!changed">
          <a-button type="default" icon="down" size="small"/>
          <a-menu slot="overlay">
            <a-menu-item @click="onReset">重置变更</a-menu-item>
          </a-menu>
        </a-dropdown>
      </a-button-group>
    </common-service-secrets>
  </a-card>
</template>

<script>
  import CommonServiceSecrets from '@/views/swarm/services/common/secrets'
  import { cloneDeep, isEmpty, isNotEmpty } from '@/utils/util'
  import { invokeApi } from '@/api/http'

  export default {
    name: 'DetailsServiceSecrets',
    components: {
      CommonServiceSecrets
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
        secrets: [],
        originalSecrets: [],
        availableSecrets: [],
        changed: false
      }
    },
    methods: {
      renderData() {
        this.data.forEach(item => {
          const record = {
            id: item['SecretID'],
            name: item['SecretName'],
            containerPath: item['File']['Name'],
            uid: isEmpty(item['File']['UID']) ? '0' : item['File']['UID'],
            gid: isEmpty(item['File']['GID']) ? '0' : item['File']['GID'],
            mode: isEmpty(item['File']['Mode']) ? 444 : item['File']['Mode']
          }
          record['editor'] = cloneDeep(record)
          record['editable'] = false
          this.secrets.push(record)
        })
        this.originalSecrets = cloneDeep(this.secrets)
      },
      onApply() {
        const params = { serviceId: this.id }
        params['secrets'] = this.configs
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
        this.secrets = cloneDeep(this.originalSecrets)
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
    },
    mounted() {
      invokeApi('/secret/list', {}).then(response => {
        if (response.code === 2000) {
          response.data.data.forEach(secret => {
            this.availableSecrets.push({ ID: secret['ID'], Name: secret['Spec']['Name'] })
          })
        } else {
        }
      })
    }
  }
</script>

<style scoped lang="less">
</style>
