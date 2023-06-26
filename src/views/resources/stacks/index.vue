<template>
  <page-view>
    <a-card :title="'应用栈列表'" :bordered="false">
      <div class="table-operator">
        <a-button icon="reload" @click="() => $refs['stacksRef'].refresh()">刷新</a-button>
        <a-popconfirm :disabled="!selectedRows.length > 0" @confirm="removeStacks">
          <template slot="title">
            删除与应用栈关联的存储卷 <a-switch v-model="withVolumes" checkedChildren="开" unCheckedChildren="关"/>
          </template>
          <a-button type="danger" icon="delete" :disabled="!selectedRows.length > 0" :loading="removing">{{ removingText }}</a-button>
        </a-popconfirm>
        <a-button type="primary" icon="plus" @click="() => this.visible = true">创建应用栈</a-button>
      </div>
      <s-table ref="stacksRef"
               :rowKey="record => record['id']"
               size="middle"
               :columns="stackOption.columns"
               :data="loadStacks"
               :alert="options.alert"
               :rowSelection="options.rowSelection">
        <template slot="id" slot-scope="text, record">
          <a-list-item>
            <a-list-item-meta>
              <a-avatar slot="avatar" size="large" shape="square" :src="'https://www.logolynx.com/images/logolynx/b7/b769fa4ba92e48da33e691a69ca62224.png'"/>
              <template slot="title">
                <router-link :to="{ path: `stacks/${record['name']}` }">
                  {{ record['name'] }}
                </router-link>
                <a-tooltip placement="right">
                  <a-icon type="info-circle"/>
                  <template slot="title">应用栈ID: {{ record['id'] }}</template>
                </a-tooltip>
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
        <template slot="internal" slot-scope="text">
          {{ text | whether }}
        </template>
        <template slot="type" slot-scope="text">
          {{ text === 1 ? 'Compose' : 'Swarm' }}
        </template>
      </s-table>
    </a-card>
    <stack-form :visible="visible" @on-close="() => this.visible = false" @submitted="() => $refs['stacksRef'].refresh()"/>
  </page-view>
</template>

<script>
  import { PageView } from '@/layouts'
  import { STable } from '@/components'
  import { invokeApi } from '@api/http'
  import StackForm from '@/views/resources/stacks/form'

  export default {
    name: 'StacksList',
    components: {
      StackForm,
      PageView,
      STable
    },
    data() {
      return {
        endpointChanged: false,
        queryParam: [],
        stackOption: {
          columns: [
            {
              title: '应用栈名称/ID',
              dataIndex: 'id',
              sorter: true,
              scopedSlots: { customRender: 'id' },
              ellipsis: true
            },
            {
              title: '应用栈类型',
              dataIndex: 'type',
              sorter: true,
              scopedSlots: { customRender: 'type' },
              ellipsis: true
            },
            {
              title: '内部控制',
              dataIndex: 'internal',
              scopedSlots: { customRender: 'internal' }
            }
          ],
          data: null
        },
        selectedRowKeys: [],
        selectedRows: [],
        // custom table alert & rowSelection
        options: {
          alert: { show: true, clear: () => { this.selectedRowKeys = [] } },
          rowSelection: {
            selectedRows: this.selectedRows,
            selectedRowKeys: this.selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
              this.selectedRowKeys = selectedRowKeys
              this.selectedRows = selectedRows
            },
            getCheckboxProps: record => ({
              props: {
                disabled: record['internal'] === 0
              }
            })
          }
        },
        visible: false,
        withVolumes: false,
        removing: false,
        removingText: '删除'
      }
    },
    methods: {
      removeStacks() {
        this.removing = true
        this.removingText = '删除中...'
        this.selectedRows.forEach(item => {
          const params = {
            stackId: item.id,
            type: item.type,
            pruneVolume: this.withVolumes
          }
          invokeApi('/stack/remove', params).then(response => {
            if (response.code === 2000) {
              this.$notification.success({ message: '成功', description: response.data })
              this.selectedRows = []
              this.selectedRowKeys = []
              this.$refs['stacksRef'].selectedRowKeys = []
              this.$refs['stacksRef'].selectedRows = []
            } else {
              this.$notification.warning({ message: '失败', description: response.data })
            }
          }).catch(() => {
            this.$notification.error({ message: '错误', description: '删除应用栈失败' })
          }).finally(() => {
            this.$refs['stacksRef'].refresh()
          })
        })
        this.withVolumes = false
        this.removing = false
        this.removingText = '删除'
      },
      loadStacks(params) {
        return invokeApi('/stack/list', { ...params, ...this.queryParam }).then(response => {
          if (response.code === 2000) {
            return response.data
          } else {
            this.$notification.warning({ message: '标题', description: '加载数据失败' })
          }
        })
      }
    },
    mounted() {
      this.loadingStacks = true
    },
    activated() {
      if (this.endpointChanged) {
        this.$refs['stacksRef'].refresh()
        this.endpointChanged = false
      }
    },
    watch: {
      '$store.state.app.endpoint': {
        deep: true,
        immediate: true,
        handler() {
          this.endpointChanged = true
        }
      }
    }
  }
</script>

<style scoped lang="less">
</style>
