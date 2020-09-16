<template>
  <a-card :bordered="false" style="margin-bottom: 20px;" class="compact">
    <template slot="title"><a-icon type="bars"/> 网络</template>
    <a-table :columns="columns"
             :dataSource="data"
             :pagination="false">
      <template slot="NetworkID" slot-scope="text">
        <router-link :to="{ path: `/resources/networks/${text}`, params: {networkId: text} }">
          {{ text }}
        </router-link>
      </template>
    </a-table>
  </a-card>
</template>

<script>
  export default {
    name: 'ServiceNetworks',
    props: {
      data: {
        type: Array,
        default: () => []
      }
    },
    data() {
      return {
        columns: [
          {
            title: '网络ID',
            dataIndex: 'NetworkID',
            sorter: true,
            scopedSlots: { customRender: 'NetworkID' }
          },
          {
            title: 'IP地址',
            dataIndex: 'Addr',
            sorter: true,
            scopedSlots: { customRender: 'Addr' }
          }
        ]
      }
    },
    methods: {}
  }
</script>

<style scoped lang="less">
</style>
