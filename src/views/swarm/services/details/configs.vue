<template>
  <a-card :bordered="false" style="margin-bottom: 20px;" class="compact">
    <template slot="title"><a-icon type="bars"/> 配置项</template>
    <div style="display: inline-flex; margin: 10px;">
      <div style="margin-right: 5px; width: 90px;">添加配置项：</div>
      <a-select size="small" style="width: 200px; margin-right: 5px" placeholder="请选择配置项">
        <a-select-option v-for="config in availableConfigs"
                         :key="config['ID']">
          {{ config['Name'] }}
        </a-select-option>
      </a-select>
      <a-button icon="plus" size="small" @click="append">添加配置项</a-button>
    </div>
    <a-table :columns="columns"
             :dataSource="data"
             :pagination="false"
             :scroll="{y: 200}">
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
        <a-input v-model="record['File']['Name']"/>
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
        <a-button icon="minus-circle" type="danger" size="small" @click="remove(record)">移除</a-button>
      </template>
      <div slot="footer" style="text-align: right;">
        <a style="float:left; margin-bottom: 20px">
          <a-button-group>
            <a-button type="primary" icon="check" size="small" :disabled="!changed" @click="apply">应用变更</a-button>
            <a-dropdown :disabled="!changed">
              <a-button type="default" icon="down" size="small"/>
              <a-menu slot="overlay">
                <a-menu-item @click="reset">重置变更</a-menu-item>
              </a-menu>
            </a-dropdown>
          </a-button-group>
        </a>
      </div>
    </a-table>
  </a-card>
</template>

<script>
  import { invokeApi } from '@api/http'

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
            scopedSlots: { customRender: 'Name' }
          },
          {
            title: '容器路径',
            dataIndex: 'Path',
            scopedSlots: { customRender: 'Path' }
          },
          {
            title: '用户',
            dataIndex: 'UID',
            scopedSlots: { customRender: 'UID' }
          },
          {
            title: '用户组',
            dataIndex: 'GID',
            scopedSlots: { customRender: 'GID' }
          },
          {
            title: '模式',
            dataIndex: 'Mode',
            scopedSlots: { customRender: 'Mode' }
          },
          {
            title: '操作',
            dataIndex: 'action',
            scopedSlots: { customRender: 'action' },
            width: 120
          }
        ],
        availableConfigs: [],
        changed: false
      }
    },
    methods: {
      append() {
      },
      remove(record) {
        this.changed = true
      },
      apply() {
        const params = {}
        invokeApi('', params).then((response) => {
        }).catch(() => {
        })
      },
      reset() {
        this.changed = false
      }
    },
    mounted() {
      invokeApi('/config/list', {}).then(response => {
        if (response.code === 2000) {
          response.data.data.forEach(config => {
            this.availableConfigs.push({ ID: config['ID'], Name: config['Spec']['Name'] })
          })
        } else {
        }
      })
    }
  }
</script>

<style scoped lang="less">
</style>
