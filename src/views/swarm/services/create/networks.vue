<template>
  <a-list size="small" :dataSource="networkItems">
    <a-list-item slot="renderItem" slot-scope="item">
      <a-col span="2">{{ item.label }}</a-col>
      <a-col span="22">
        <template v-if="item.prop === 'network'">
          <a-select v-model="data['network']" :allow-clear="true" placeholder="请选择网络" style="width: 200px">
            <a-select-option v-for="network in availableNetworks"
                             :key="network.Id"
                             :value="network.Name">
              {{ network.Name }}
            </a-select-option>
          </a-select>
        </template>
        <template v-if="item.prop === 'hostname'">
          <a-input v-model="data['hostname']" :allow-clear="true" placeholder="例如：localhost" style="width: 200px"/>
        </template>
        <template v-else-if="item.prop === 'hosts'">
          <coco-editor-table :columns="hostsColumns"
                             :data="hostsData"
                             :button-text="'添加Host映射'"/>
        </template>
      </a-col>
    </a-list-item>
  </a-list>
</template>

<script>
  import { CocoEditorTable } from '@/components/Coco'
  import { invokeApi } from '@api/http'

  export default {
    name: 'CreateServiceNetworks',
    components: {
      CocoEditorTable
    },
    props: {
      data: {
        type: Object,
        default: () => {
          return {
            network: undefined,
            hostname: '',
            hosts: []
          }
        }
      }
    },
    data() {
      return {
        networkItems: [
          {
            label: '网络',
            value: null,
            prop: 'network'
          },
          {
            label: '主机名',
            value: null,
            prop: 'hostname'
          },
          {
            label: 'Host映射',
            value: null,
            prop: 'hosts'
          }
        ],
        hostsData: [],
        hostsColumns: [
          {
            title: '主机名称',
            dataIndex: 'host',
            scopedSlots: { customRender: 'host' }
          },
          {
            title: 'IP地址',
            dataIndex: 'ipAddress',
            scopedSlots: { customRender: 'ipAddress' }
          },
          {
            title: '操作',
            dataIndex: 'action',
            scopedSlots: { customRender: 'action' },
            width: 130
          }
        ],
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
