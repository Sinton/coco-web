<template>
  <a-form :form="networkForm">
    <a-form-item v-bind="formItemLayout" label="网络">
      <a-select v-model="networkForm.network" placeholder="请选择网络">
        <a-select-option v-for="network in availableNetworks"
                         :key="network.id"
                         :value="network.id">
          {{ network.name }}
        </a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item v-bind="formItemLayout" label="IPv4地址">
      <a-input/>
    </a-form-item>
    <a-form-item v-bind="formItemLayout" label="IPv6地址">
      <a-input/>
    </a-form-item>
    <a-form-item v-bind="formItemLayout" label="MAC地址">
      <a-input/>
    </a-form-item>
    <a-form-item v-bind="formItemLayout" label="主机名">
      <a-input/>
    </a-form-item>
    <a-form-item v-bind="formItemLayout" label="域名">
      <a-input/>
    </a-form-item>
  </a-form>
</template>

<script>
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
        networkForm: {
          network: '',
          hostname: '',
          domainName: '',
          macAddr: '',
          ipv4: '',
          ipv6: ''
        },
        availableNetworks: []
      }
    },
    methods: {}
  }
</script>

<style scoped lang="less">
</style>
