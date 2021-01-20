<template>
  <a-form :form="data">
    <a-form-item v-bind="formItemLayout" label="网络">
      <a-select v-model="data.network" :allow-clear="true" placeholder="请选择网络">
        <a-select-option v-for="network in availableNetworks"
                         :key="network.Id"
                         :value="network.Name">
          {{ network.Name }}
        </a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item v-bind="formItemLayout" label="IPv4地址">
      <a-input v-model="data.ipv4" placeholder="例如 172.20.0.7"/>
    </a-form-item>
    <a-form-item v-bind="formItemLayout" label="IPv6地址">
      <a-input v-model="data.ipv6" placeholder="例如 a:b:c:d::1234"/>
    </a-form-item>
    <a-form-item v-bind="formItemLayout" label="MAC地址">
      <a-input v-model="data.macAddr"placeholder="例如 12-34-56-78-9a-bc"/>
    </a-form-item>
    <a-form-item v-bind="formItemLayout" label="域名">
      <a-input v-model="data.domainName" placeholder="例如 example.com"/>
    </a-form-item>
    <a-form-item v-bind="formItemLayout" label="主机名">
      <a-input v-model="data.hostname" placeholder="例如 localhost"/>
    </a-form-item>
  </a-form>
</template>

<script>
  import { invokeApi } from '@api/http'

  export default {
    name: 'ContainerNetworks',
    props: {
      formItemLayout: {
        type: Object,
        default: () => {}
      },
      data: {
        type: Object,
        default: () => {}
      }
    },
    data() {
      return {
        availableNetworks: []
      }
    },
    methods: {
      loadNetworks() {
        invokeApi('/network/list', {}).then(response => {
          if (response.code === 2000) {
            this.availableNetworks = response.data.data
          } else {
            this.$notification.warning({ message: '提示', description: response.data })
          }
        }).catch(() => {
          this.$notification.error({ message: '错误', description: '加载容器网络发生异常' })
        })
      }
    },
    mounted() {
      this.loadNetworks()
    }
  }
</script>

<style scoped lang="less">
</style>
