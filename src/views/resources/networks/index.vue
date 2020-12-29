<template>
  <page-view>
    <a-card :title="'容器网络列表'" :bordered="false">
      <div class="table-operator">
        <a-button icon="reload" @click="() => $refs['networksRef'].refresh()">刷新</a-button>
        <a-button type="danger" icon="delete" :disabled="!selectedRows.length > 0" @click="removeNetwork">删除</a-button>
        <a-button type="primary" icon="plus">创建网络</a-button>
      </div>
      <s-table ref="networksRef"
               :rowKey="record => record['Id']"
               size="middle"
               :scroll="{ x: 'calc(700px + 50%)'}"
               :columns="columns"
               :data="loadNetworks"
               :alert="options.alert"
               :rowSelection="options.rowSelection">
        <!-- 网络名称 -->
        <template slot="Id" slot-scope="text, record">
          <router-link :to="{ path: `networks/${text}`, params: { networkId: text } }">
            {{ record['Name'] + record['Name'] | truncate(32) }}
          </router-link>
          <a-tooltip placement="right">
            <a-icon type="info-circle"/>
            <template slot="title">{{ text }}</template>
          </a-tooltip>
        </template>
        <!-- 应用栈 -->
        <template slot="Stack" slot-scope="text, record">
          {{ record['Labels'] | stackName }}
        </template>
        <template slot="IPAMDriver" slot-scope="text, record">
          {{ record['IPAM']['Driver'] }}
        </template>
        <template slot="Attachable" slot-scope="text, record">
          {{ record['Attachable'] | whether }}
        </template>
        <template slot="Internal" slot-scope="text, record">
          {{ record['Internal'] | whether }}
        </template>
        <template slot="IPAMSubnet" slot-scope="text, record">
          {{ record['IPAM']['Config'] | convertIPAM('Subnet') }}
        </template>
        <template slot="IPAMGateway" slot-scope="text, record">
          {{ record['IPAM']['Config'] | convertIPAM('Gateway') }}
        </template>
      </s-table>
    </a-card>
  </page-view>
</template>

<script>
  import { PageView } from '@/layouts'
  import { STable } from '@/components'
  import { invokeApi } from '@api/http'

  export default {
    name: 'NetworksList',
    components: {
      PageView,
      STable
    },
    data() {
      return {
        queryParam: [],
        columns: [
          {
            title: '网络名称',
            dataIndex: 'Id',
            sorter: true,
            scopedSlots: { customRender: 'Id' },
            width: 260
          },
          {
            title: '应用栈',
            dataIndex: 'Stack',
            sorter: true,
            scopedSlots: { customRender: 'Stack' }
          },
          {
            title: '作用域',
            dataIndex: 'Scope',
            sorter: true,
            scopedSlots: { customRender: 'Scope' },
            width: 80
          },
          {
            title: '驱动',
            dataIndex: 'Driver',
            sorter: true,
            scopedSlots: { customRender: 'Driver' },
            width: 80
          },
          {
            title: '是否可附加',
            dataIndex: 'Attachable',
            sorter: true,
            scopedSlots: { customRender: 'Attachable' },
            width: 110
          },
          {
            title: '是否内部',
            dataIndex: 'Internal',
            sorter: true,
            scopedSlots: { customRender: 'Internal' },
            width: 100
          },
          {
            title: 'IPAM 驱动',
            dataIndex: 'IPAMDriver',
            sorter: true,
            scopedSlots: { customRender: 'IPAMDriver' },
            width: 110
          },
          {
            title: 'IPAM 子网',
            dataIndex: 'IPAMSubnet',
            sorter: true,
            scopedSlots: { customRender: 'IPAMSubnet' },
            width: 110
          },
          {
            title: 'IPAM 子网',
            dataIndex: 'IPAMGateway',
            sorter: true,
            scopedSlots: { customRender: 'IPAMGateway' },
            width: 110
          }
        ],
        selectedRowKeys: [],
        selectedRows: [],
        // custom table alert & rowSelection
        options: {
          alert: { show: true, clear: () => { this.selectedRowKeys = [] } },
          rowSelection: {
            selectedRows: this.selectedRows,
            selectedRowKeys: this.selectedRowKeys,
            onChange: this.onSelectChange
          }
        }
      }
    },
    filters: {
      stackName(label) {
        let stack = '-'
        if (label && label['com.docker.compose.project']) {
          stack = label['com.docker.compose.project']
        } else if (label && label['com.docker.stack.namespace']) {
          stack = label['com.docker.stack.namespace']
        }
        return stack
      },
      convertIPAM(ipamConfig, type) {
        if (ipamConfig && ipamConfig.length >= 0) {
          return ipamConfig.length > 0 ? ipamConfig[0][type] : ''
        }
        return '-'
      }
    },
    methods: {
      removeNetwork() {
        this.selectedRows.forEach(item => {
          const params = {
            networkId: item.Id
          }
          invokeApi('/network/remove', params).then(response => {
            if (response.code === 2000) {
              this.selectedRows = []
              this.selectedRowKeys = []
              this.$refs['networksRef'].selectedRows = this.selectedRows
              this.$refs['networksRef'].selectedRowKeys = this.selectedRowKeys
              this.$notification.success({ message: '提示', description: response.data })
            } else {
              this.$notification.error({ message: '提示', description: response.data })
            }
          }).catch(() => {
            this.$notification.error({ message: '错误', description: '请求接口异常' })
          }).finally(() => {
            this.$refs['networksRef'].refresh()
          })
        })
      },
      loadNetworks(params) {
        return invokeApi('/network/list', { ...params, ...this.queryParam }).then(response => {
          if (response.code === 2000) {
            return response.data
          } else {
            this.$notification.error({
              message: '标题',
              description: '加载数据失败'
            })
          }
        })
      },
      onSelectChange(selectedRowKeys, selectedRows) {
        this.selectedRowKeys = selectedRowKeys
        this.selectedRows = selectedRows
      }
    }
  }
</script>

<style scoped lang="less">
</style>
