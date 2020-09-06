<template>
  <a-card :bordered="false" style="margin-bottom: 20px;" class="compact">
    <template slot="title"><a-icon type="bars"/> 加密配置项</template>
    <a-table :columns="columns"
             :dataSource="data"
             :pagination="false">
      <template slot="Name" slot-scope="text, record">
        <router-link :to="{ path: `/swarm/secrets` }">
          {{ record['SecretName'] }}
        </router-link>
        <a-tooltip placement="right">
          <a-icon type="info-circle"/>
          <template slot="title">加密配置项ID: {{ record['SecretID'] }}</template>
        </a-tooltip>
      </template>
      <template slot="Filename" slot-scope="text, record">
        {{ record['File']['Name'] }}
      </template>
      <template slot="UID" slot-scope="text, record">
        {{ record['File']['UID'] }}
      </template>
      <template slot="GID" slot-scope="text, record">
        {{ record['File']['GID'] }}
      </template>
      <template slot="Mode" slot-scope="text, record">
        {{ record['File']['Mode'] }}
      </template>
      <template slot="action" slot-scope="text, record">
        <a-button icon="minus-circle" type="danger" size="small">移除</a-button>
      </template>
    </a-table>
  </a-card>
</template>

<script>
  export default {
    name: 'ServiceSecrets',
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
            title: '加密配置项名称',
            dataIndex: 'Name',
            sorter: true,
            scopedSlots: { customRender: 'Name' }
          },
          {
            title: '文件名',
            dataIndex: 'Filename',
            sorter: true,
            scopedSlots: { customRender: 'Filename' }
          },
          {
            title: '用户',
            dataIndex: 'UID',
            sorter: true,
            scopedSlots: { customRender: 'UID' }
          },
          {
            title: '用户组',
            dataIndex: 'GID',
            sorter: true,
            scopedSlots: { customRender: 'GID' }
          },
          {
            title: '模式',
            dataIndex: 'Mode',
            sorter: true,
            scopedSlots: { customRender: 'Mode' }
          },
          {
            title: '操作',
            dataIndex: 'action',
            width: 150,
            scopedSlots: { customRender: 'action' }
          }
        ]
      }
    },
    methods: {}
  }
</script>

<style scoped lang="less">
</style>
