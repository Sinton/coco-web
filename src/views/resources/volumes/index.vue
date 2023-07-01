<template>
  <page-view>
    <a-card :title="'存储卷列表'" :bordered="false">
      <div class="table-operator">
        <a-button icon="reload" @click="() => $refs['volumesRef'].refresh()">刷新</a-button>
        <a-button type="danger" icon="delete" :disabled="!selectedRows.length > 0" @click="removeVolume">删除</a-button>
        <a-button type="primary" icon="plus" @click="() => this.visible = true">创建存储卷</a-button>
      </div>
      <s-table ref="volumesRef"
               :rowKey="record => record['Name']"
               size="middle"
               :columns="columns"
               :data="loadVolumes"
               :alert="options.alert"
               :rowSelection="options.rowSelection">
        <template slot="Name" slot-scope="text">
          <router-link :to="{ path: `volumes/${text}`, params: { volumeName: text } }">
            {{ text | truncate(32) }}
          </router-link>
          <a-tag v-if="unusedVolumes.includes(text)" color="#faad14">未被使用</a-tag>
        </template>
        <template slot="Stack" slot-scope="text, record">{{ record['Labels'] | stackName | truncate(12) }}</template>
        <template slot="Mountpoint" slot-scope="text">{{ text | truncatelr(50, 25, 15) }}</template>
        <template slot="CreatedAt" slot-scope="text">{{ text | moment }}</template>
      </s-table>
    </a-card>
    <volume-form :visible="visible" @on-close="() => this.visible = false" @added="() => this.$refs['volumesRef'].refresh()"/>
  </page-view>
</template>

<script>
  import { PageView } from '@/layouts'
  import { STable } from '@/components'
  import { invokeApi } from '@api/http'
  import VolumeForm from '@/views/resources/volumes/form'

  export default {
    name: 'VolumesList',
    components: {
      VolumeForm,
      PageView,
      STable
    },
    data() {
      return {
        endpointChanged: false,
        columns: [
          {
            title: '存储卷名称',
            dataIndex: 'Name',
            sorter: true,
            scopedSlots: { customRender: 'Name' },
            width: 250
          },
          {
            title: '应用栈',
            dataIndex: 'Stack',
            sorter: true,
            scopedSlots: { customRender: 'Stack' }
          },
          {
            title: '存储卷驱动',
            dataIndex: 'Driver',
            sorter: true,
            scopedSlots: { customRender: 'Driver' },
            width: 110
          },
          {
            title: '宿主机挂载点',
            dataIndex: 'Mountpoint',
            sorter: true,
            scopedSlots: { customRender: 'Mountpoint' }
          },
          {
            title: '创建时间',
            dataIndex: 'CreatedAt',
            sorter: true,
            scopedSlots: { customRender: 'CreatedAt' },
            width: 145
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
            onChange: (selectedRowKeys, selectedRows) => {
              this.selectedRowKeys = selectedRowKeys
              this.selectedRows = selectedRows
            }
          }
        },
        visible: false,
        unusedVolumes: []
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
      }
    },
    methods: {
      loadVolumes(params) {
        this.loadUnusedVolumes()
        return invokeApi('/volume/list', params).then(response => {
          if (response.code === 2000) {
            return response.data
          } else {
            this.$notification.error({ message: '标题', description: '加载数据失败' })
          }
        })
      },
      loadUnusedVolumes() {
        const params = {
          filter: { dangling: true }
        }
        invokeApi('/volume/list', params).then(response => {
          if (response.code === 2000) {
            this.unusedVolumes = response.data.data.map(item => item.Name)
          } else {
            this.$notification.error({ message: '标题', description: '加载数据失败' })
          }
        })
      },
      removeVolume() {
        this.selectedRows.forEach(item => {
          const params = {
            volumeName: item.Name
          }
          invokeApi('/volume/remove', params).then(response => {
            if (response.code === 2000) {
              this.selectedRows = []
              this.selectedRowKeys = []
              this.$refs['volumesRef'].selectedRows = this.selectedRows
              this.$refs['volumesRef'].selectedRowKeys = this.selectedRowKeys
              this.$notification.success({ message: '提示', description: response.data })
            } else {
              this.$notification.warning({ message: '标题', description: response.data })
            }
          }).catch(() => {
            this.$notification.error({ message: '错误', description: '请求接口异常' })
          }).finally(() => {
            this.$refs['volumesRef'].refresh()
          })
        })
      }
    },
    activated() {
      if (this.endpointChanged) {
        this.$refs['volumesRef'].refresh()
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
