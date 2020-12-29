<template>
  <page-view>
    <a-card :title="'终端列表'" :bordered="false">
      <div slot="extra">
        <a-button-group>
          <a-button icon="table" @click="displayMode = 'table'"/>
          <a-button icon="profile" @click="displayMode = 'list'"/>
        </a-button-group>
      </div>
      <div class="table-operator">
        <a-button icon="reload" @click="loadEndpoints">刷新</a-button>
        <a-button type="danger" icon="delete" :disabled="!selectedRows.length > 0" @click="removeEndpoints">删除</a-button>
        <a-button type="primary" icon="plus" @click="addEndpoint">添加新终端</a-button>
      </div>

      <a-list v-if="displayMode === 'list'" :item-layout="'horizontal'" :bordered="true" :data-source="endpoints">
        <a-list-item slot="renderItem" slot-scope="record">
          <a-list-item-meta>
            <a-avatar slot="avatar" size="large" shape="square" :src="'https://www.logolynx.com/images/logolynx/b7/b769fa4ba92e48da33e691a69ca62224.png'"/>
            <template slot="title">
              <span style="font-weight: bold; font-size: 1.2em; margin-right: 10px"> {{ record['name'] }}</span>
              <a-tag color="#52c41a">{{ record['status'] === 1 ? '就绪在线' : '下线' }}</a-tag>
              {{ record['updateDateTime'] | moment }}
            </template>
            <template slot="description">
              <h5>
                <a-icon type="copy" /> 应用栈 {{ JSON.parse(record['dockerConfig'])['stacks'] }}
                <a-divider type="vertical" />
                <a-icon type="copy" /> 应用服务 {{ JSON.parse(record['dockerConfig'])['services'] }}
                <a-divider type="vertical" />
                <a-icon type="copy" /> 容器 {{ JSON.parse(record['dockerConfig'])['containers']['total'] }}-
                <a-icon type="heart" theme="twoTone" two-tone-color="#52c41a"/> {{ JSON.parse(record['dockerConfig'])['containers']['running'] }}
                <a-icon type="heart" theme="twoTone" two-tone-color="#f5222d"/> {{ JSON.parse(record['dockerConfig'])['containers']['stoped'] }}
                <a-divider type="vertical" />
                <a-icon type="copy" /> 镜像 {{ JSON.parse(record['dockerConfig'])['images']['total'] }}
                <a-divider type="vertical" />
                <a-icon type="copy" /> 存储卷 {{ JSON.parse(record['dockerConfig'])['volumes'] }}
                <a-divider type="vertical" />
                <a-icon type="copy" /> 网络 {{ JSON.parse(record['dockerConfig'])['networks'] }}
              </h5>
              <a-icon type="copy" /> {{ JSON.parse(record['resources'])['cpus'] }}
              <a-divider type="vertical" />
              <a-icon type="copy" /> {{ JSON.parse(record['resources'])['memory'] }}
            </template>
          </a-list-item-meta>
          <template slot="actions">
            <a-avatar :style="{ backgroundColor: record['id'] === selectedEndpoint ? '#52c41a' : '#f56a00'}"
                      @click="switchEndpoint(record['id'])">
              {{ record['id'] === selectedEndpoint ? '使用' : '未用' }}
            </a-avatar>
          </template>
          <div slot="extra">
            <span style="color: #00000073;">{{ record['endpointUrl'] }}</span>
            <a-divider type="vertical" />
            <span style="color: #00000073;">{{ JSON.parse(record['dockerConfig'])['cluster'] }}</span>
            <a-divider type="vertical" />
            <span style="color: #00000073;">{{ JSON.parse(record['dockerConfig'])['version'] }}</span>
          </div>
        </a-list-item>
      </a-list>
      <s-table v-else-if="displayMode === 'table'"
               ref="endpointsRef"
               :rowKey="record => record['id']"
               size="middle"
               :columns="columns"
               :data="loadEndpoints"
               :alert="options.alert"
               :rowSelection="options.rowSelection">
        <template slot="id" slot-scope="text, record">
          {{ record['name'] }}
          <a-tooltip placement="right">
            <a-icon type="info-circle"/>
            <template slot="title">服务终端ID: {{ text }}</template>
          </a-tooltip>
        </template>
        <template slot="status" slot-scope="text, record">
          <a-badge :color="record['status'] === 1 ? '#52c41a' : '#f5222d'" :text="record['status'] === 1 ? '就绪在线' : '下线'"/>
        </template>
        <template slot="action" slot-scope="text, record">
          <a @click="modifyEndpoint(text)">修改</a>
        </template>
      </s-table>
    </a-card>
    <endpoint-form :visible="visible" :data="endpointForm" @on-close="closeForm" @on-reload="reloadEndpoints"/>
  </page-view>
</template>

<script>
  import { PageView } from '@/layouts'
  import { STable } from '@/components'
  import { invokeApi } from '@api/http'
  import EndpointForm from '@views/resources/endpoints/form'
  import { mapState } from 'vuex'

  export default {
    name: 'Endpoints',
    components: {
      EndpointForm,
      PageView,
      STable
    },
    data() {
      return {
        displayMode: 'list',
        columns: [
          {
            title: '服务终端名称/ID',
            dataIndex: 'id',
            scopedSlots: { customRender: 'id' },
            ellipsis: true
          },
          {
            title: '状态',
            dataIndex: 'status',
            scopedSlots: { customRender: 'status' },
            ellipsis: true
          },
          {
            title: 'URL',
            dataIndex: 'endpointUrl',
            scopedSlots: { customRender: 'endpointUrl' },
            ellipsis: true
          },
          {
            title: '操作',
            dataIndex: 'action',
            scopedSlots: { customRender: 'action' },
            width: 80
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
        },
        visible: false,
        endpoints: [],
        endpointForm: this.$form.createForm(this)
      }
    },
    computed: {
      ...mapState({
        selectedEndpoint: state => state.app.endpoint
      })
    },
    methods: {
      onSelectChange(selectedRowKeys, selectedRows) {
        this.selectedRowKeys = selectedRowKeys
        this.selectedRows = selectedRows
      },
      closeForm() {
        this.visible = false
      },
      addEndpoint() {
        this.visible = true
      },
      removeEndpoints() {
        this.selectedRows.forEach(item => {
          const params = {
            id: item.id
          }
          invokeApi('/endpoint/remove', params).then(response => {
            if (response.code === 2000) {
              this.$notification.success({ message: '成功', description: response.data })
              this.$refs['endpointsRef'].selectedRowKeys = []
              this.$refs['endpointsRef'].selectedRows = []
            } else {
              this.$notification.warning({ message: '失败', description: response.data })
            }
          }).catch((error) => {
            this.$notification.error({ message: '错误', description: error })
          }).finally(() => {
            this.$refs['endpointsRef'].refresh()
          })
        })
      },
      modifyEndpoint(endpoint) {
        console.log(endpoint)
        this.visible = true
        // this.endpointForm['url'] = endpoint['endpointUrl']
        // this.endpointForm['ip'] = endpoint['publicIp']
        // this.endpointForm['tls'] = endpoint['tlsEnable'] === 1
      },
      switchEndpoint(endpointId) {
        const params = {
          id: endpointId
        }
        invokeApi('/endpoint/switch', params).then(response => {
          console.log(response)
          this.$store.dispatch('SwitchEndpoint', endpointId)
        }).catch(() => {
          this.$notification.error({ message: '标题', description: '切换服务终端失败' })
        })
      },
      reloadEndpoints() {
        this.$refs['endpointsRef'].refresh()
      },
      loadEndpoints() {
        return invokeApi('/endpoint/list', {}).then(response => {
          if (response.code === 2000) {
            this.endpoints = response.data.data
            return response.data
          } else {
            this.$notification.warning({ message: '标题', description: '加载数据失败' })
          }
        }).catch(() => {
          this.$notification.error({ message: '标题', description: '加载数据失败' })
        })
      }
    },
    mounted() {
      this.loadEndpoints()
    }
  }
</script>

<style scoped lang="less">
</style>
