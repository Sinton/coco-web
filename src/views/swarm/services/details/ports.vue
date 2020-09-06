<template>
  <a-card :bordered="false" style="margin-bottom: 20px;" class="compact">
    <template slot="title"><a-icon type="bars"/> 端口映射</template>
    <a-table :columns="columns"
             :dataSource="data"
             :pagination="false">
      <template slot="action" slot-scope="text, record">
        <a-button icon="minus-circle" type="danger" size="small">移除</a-button>
      </template>
      <div slot="footer" style="text-align: right;">
        <a style="float:left;">
          <a-button-group>
            <a-button type="primary" icon="check" size="small" :disabled="!changed">应用变更</a-button>
            <a-dropdown :disabled="!changed">
              <a-button type="default" icon="down" size="small"/>
              <a-menu slot="overlay">
                <a-menu-item>重置变更</a-menu-item>
              </a-menu>
            </a-dropdown>
          </a-button-group>
        </a>
        <a><a-button shape="circle" type="primary" icon="plus" size="small" style="margin-right: 5px"></a-button>添加端口映射</a>
      </div>
    </a-table>
  </a-card>
</template>

<script>
  import { invokeApi } from '@api/http'

  export default {
    name: 'ServicePorts',
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
            title: '映射主机端口',
            dataIndex: 'PublishedPort',
            sorter: true,
            scopedSlots: { customRender: 'PublishedPort' }
          },
          {
            title: '容器端口',
            dataIndex: 'TargetPort',
            sorter: true,
            scopedSlots: { customRender: 'TargetPort' }
          },
          {
            title: '协议',
            dataIndex: 'Protocol',
            sorter: true,
            scopedSlots: { customRender: 'Protocol' }
          },
          {
            title: '映射模式',
            dataIndex: 'PublishMode',
            sorter: true,
            scopedSlots: { customRender: 'PublishMode' }
          },
          {
            title: '操作',
            dataIndex: 'action',
            width: 150,
            scopedSlots: { customRender: 'action' }
          }
        ],
        changed: false
      }
    },
    methods: {
      updatePorts() {
        const params = {}
        invokeApi('', params).then((response) => {
        }).catch(() => {})
      }
    }
  }
</script>

<style scoped lang="less">
</style>
