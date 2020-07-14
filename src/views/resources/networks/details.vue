<template>
  <page-view logo="https://gw.alipayobjects.com/zos/rmsportal/nxkuOJlFJuAUhzlMTCEe.png">
    <detail-list slot="headerContent" size="small" :col="2" class="detail-layout">
      <detail-list-item v-for="desc in detailsOption.desc"
                        :key="desc.prop"
                        :term="desc.label">
        {{ desc.value | whether }}
      </detail-list-item>
    </detail-list>
    <template slot="headerContent">
      <a-button icon="delete" type="link" @click="removeNetwork()">移除</a-button>
    </template>

    <a-card v-if="detailsOption.options.length > 0" :title="'网络配置项'" :bordered="false" style="margin-bottom: 20px;">
      <a-list size="small" :dataSource="detailsOption.options">
        <a-list-item slot="renderItem" slot-scope="item">
          <a-col span="12">{{ item.label }}</a-col>
          <a-col span="12">{{ item.value }}</a-col>
        </a-list-item>
      </a-list>
    </a-card>

    <a-card v-if="containersOption.data.length > 0" :title="'在网络中的容器'" :bordered="false" style="margin-bottom: 20px;" class="compact">
      <a-table :columns="containersOption.columns"
               :dataSource="containersOption.data"
               :pagination="false">
        <!-- 容器名称 -->
        <template slot="Name" slot-scope="text, record">
          <router-link :to="{ path: `/resources/containers/${record['Id']}`, params: { containerId: record['Id'] } }">
            {{ text }}
          </router-link>
          <a-tooltip placement="right">
            <a-icon type="info-circle"/>
            <template slot="title">{{ record['Id'] }}</template>
          </a-tooltip>
        </template>
        <!-- 操作列-->
        <template slot="action" slot-scope="text, record">
          <a-button icon="delete" type="danger" size="small" @click="leaveNetwork(record.Id)">离开网络</a-button>
        </template>
      </a-table>
    </a-card>
  </page-view>
</template>

<script>
  import { PageView } from '@/layouts'
  import DetailList from '@/components/tools/DetailList'
  import { invokeApi } from '@api/http'

  const DetailListItem = DetailList.Item

  export default {
    name: 'NetworkDetails',
    components: {
      PageView,
      DetailList,
      DetailListItem
    },
    data() {
      return {
        networkInspect: null,
        detailsOption: {
          desc: [],
          options: []
        },
        containersOption: {
          columns: [
            {
              title: '容器名称',
              dataIndex: 'Name',
              sorter: true,
              scopedSlots: { customRender: 'Name' },
              ellipsis: true
            },
            {
              title: 'MAC地址',
              dataIndex: 'MacAddress',
              sorter: true,
              scopedSlots: { customRender: 'MacAddress' },
              ellipsis: true
            },
            {
              title: 'IPv4地址',
              dataIndex: 'IPv4Address',
              sorter: true,
              scopedSlots: { customRender: 'IPv4Address' },
              ellipsis: true
            },
            {
              title: 'IPv6地址',
              dataIndex: 'IPv6Address',
              sorter: true,
              scopedSlots: { customRender: 'IPv6Address' },
              ellipsis: true
            },
            {
              title: '操作',
              dataIndex: 'action',
              scopedSlots: { customRender: 'action' }
            }
          ],
          data: []
        }
      }
    },
    filters: {},
    methods: {
      inspectNetwork(params) {
        invokeApi('/network/inspect', params).then(response => {
          if (response.code === 2000) {
            this.networkInspect = response.data
            this.buildDetails()
            this.buildNetworkOption()
            this.buildContainerInNetwork()
          }
        })
      },
      removeNetwork() {
        invokeApi('/network/remove', { networkId: this.networkId }).then(response => {
          if (response.code === 2000) {
          }
        })
      },
      leaveNetwork(containerId) {
      },
      buildDetails() {
        this.detailsOption.desc.push(
          {
            label: '网络名称',
            value: this.networkInspect['Name'],
            prop: 'name'
          },
          {
            label: 'ID',
            value: this.networkInspect['Id'],
            prop: 'id'
          },
          {
            label: '驱动',
            value: this.networkInspect['Driver'],
            prop: 'driver'
          },
          {
            label: '作用域',
            value: this.networkInspect['Scope'],
            prop: 'scope'
          },
          {
            label: '是否内部',
            value: this.networkInspect['Internal'],
            prop: 'internal'
          },
          {
            label: '是否可附加',
            value: this.networkInspect['Attachable'],
            prop: 'attachable'
          }
        )
        if (this.networkInspect['IPAM']['Config'] && this.networkInspect['IPAM']['Config'].length > 0) {
          this.detailsOption.desc.push(
            {
              label: `子网 - ${this.networkInspect['IPAM']['Config'][0]['Subnet']}`,
              value: `网关 - ${this.networkInspect['IPAM']['Config'][0]['Gateway']}`,
              prop: 'ipam'
            }
          )
        }
      },
      buildNetworkOption() {
        Object.keys(this.networkInspect['Options']).forEach(option => {
          this.detailsOption.options.push({
            label: option,
            value: this.networkInspect['Options'][option]
          })
        })
      },
      buildContainerInNetwork() {
        Object.keys(this.networkInspect['Containers']).forEach(containerId => {
          const container = this.networkInspect['Containers'][containerId]
          this.containersOption.data.push({
            Id: containerId,
            Name: container['Name'],
            EndpointID: container['EndpointID'],
            MacAddress: container['MacAddress'] || '-',
            IPv4Address: container['IPv4Address'] || '-',
            IPv6Address: container['IPv6Address'] || '-'
          })
        })
      }
    },
    computed: {
      networkId() {
        return this.$route.params.id
      }
    },
    watch: {
      imageId: {
        deep: true,
        immediate: true,
        handler() {
          if (Object.keys(this.$route.params).includes('id')) {
            const params = { networkId: this.$route.params.id }
            this.inspectNetwork(params)
          }
        }
      }
    }
  }
</script>

<style scoped lang="less">
  .detail-layout {
    margin-left: 44px;
  }
  .text {
    color: rgba(0, 0, 0, .45);
  }

  .heading {
    color: rgba(0, 0, 0, .85);
    font-size: 20px;
  }

  .no-data {
    color: rgba(0, 0, 0, .25);
    text-align: center;
    line-height: 64px;
    font-size: 16px;

    i {
      font-size: 24px;
      margin-right: 16px;
      position: relative;
      top: 3px;
    }
  }
  /deep/ .compact .ant-card-body {
    padding: 0;
  }
  /deep/ .logs .ant-drawer-body {
    padding: 0;
  }
</style>
