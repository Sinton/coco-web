<template>
  <a-card :bordered="false" style="margin-bottom: 20px;" class="compact">
    <template slot="title"><a-icon type="bars"/> 服务标签</template>
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
        <a><a-button shape="circle" type="primary" icon="plus" size="small" style="margin-right: 5px"></a-button>添加服务标签</a>
      </div>
    </a-table>
  </a-card>
</template>

<script>
  export default {
    name: 'ServiceServiceLabels',
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
            title: '标签项',
            dataIndex: 'Label',
            sorter: true,
            scopedSlots: { customRender: 'Label' }
          },
          {
            title: '标签值',
            dataIndex: 'Value',
            sorter: true,
            scopedSlots: { customRender: 'Value' }
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
    methods: {}
  }
</script>

<style scoped lang="less">
</style>
