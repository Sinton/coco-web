<template>
  <a-card :bordered="false" style="margin-bottom: 20px;" class="compact">
    <template slot="title"><a-icon type="bars"/> 配置项</template>
    <div style="display: inline-flex; margin: 10px;">
      <div style="margin-right: 5px; width: 90px;">添加配置项：</div>
      <a-select size="small" mode="tags" style="width: 200px; margin-right: 5px" placeholder="请选择配置项">
        <a-select-option v-for="i in 25" :key="(i + 9).toString(36) + i">
          {{ (i + 9).toString(36) + i }}
        </a-select-option>
      </a-select>
      <a-button icon="plus" size="small">添加配置项</a-button>
    </div>
    <a-table :columns="columns"
             :dataSource="data"
             :pagination="false">
      <template slot="Name" slot-scope="text, record">
        <router-link :to="{ path: `/swarm/configs` }">
          {{ record['ConfigName'] }}
        </router-link>
        <a-tooltip placement="right">
          <a-icon type="info-circle"/>
          <template slot="title">配置项ID: {{ record['ConfigID'] }}</template>
        </a-tooltip>
      </template>
      <template slot="Path" slot-scope="text, record">
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
    name: 'ServiceConfigs',
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
            title: '配置项名称',
            dataIndex: 'Name',
            sorter: true,
            scopedSlots: { customRender: 'Name' }
          },
          {
            title: '容器路径',
            dataIndex: 'Path',
            sorter: true,
            scopedSlots: { customRender: 'Path' }
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
