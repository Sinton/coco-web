<template>
  <page-view>
    <a-card title="主机详情" style="margin-bottom: 20px;">
      <a-list size="small" :dataSource="hostDetails">
        <a-list-item slot="renderItem" slot-scope="item">
          <a-col span="4">{{ item.label }}</a-col>
          <a-col span="20">{{ item.value }}</a-col>
        </a-list-item>
      </a-list>
    </a-card>
    <a-card title="引擎详情" style="margin-bottom: 20px;">
      <a-list size="small" :dataSource="engineDetails">
        <a-list-item slot="renderItem" slot-scope="item">
          <a-col span="4">{{ item.label }}</a-col>
          <a-col span="20">{{ item.value }}</a-col>
        </a-list-item>
      </a-list>
    </a-card>
    <a-card title="节点详情">
      <a-list size="small" :dataSource="nodeDetails">
        <a-list-item slot="renderItem" slot-scope="item">
          <a-col span="4">{{ item.label }}</a-col>
          <a-col span="20">
            <template v-if="item.prop === 'availability'">
              <a-select v-model="item.value" @change="changedAvailability" size="small">
                <a-select-option value="active">Active</a-select-option>
                <a-select-option value="pause">Pause</a-select-option>
                <a-select-option value="drain">Drain</a-select-option>
              </a-select>
            </template>
            <template v-else-if="item.prop === 'status'">
              <a-tag :color="item.value | nodeStatus">{{ item.value }}</a-tag>
            </template>
            <template v-else-if="item.prop === 'labels'">
              <coco-editor-table :columns="nodeLabelColumns"
                                 :data="nodeLabelData"
                                 :button-text="'新增节点标签'"
                                 @append="changed = true"
                                 @save="changed = true"
                                 @remove="changed = true">
                <template slot="footer">
                  <a style="float:left;">
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
                </template>
              </coco-editor-table>
            </template>
            <template v-else>{{ item.value }}</template>
          </a-col>
        </a-list-item>
      </a-list>
    </a-card>
  </page-view>
</template>

<script>
  import { PageView } from '@/layouts'
  import { invokeApi } from '@api/http'
  import { convertSize } from '@/utils/util'
  import CocoEditorTable from '@/components/Coco/CocoEditorTable/CocoEditorTable'

  export default {
    name: 'NodeDetails',
    components: {
      PageView,
      CocoEditorTable
    },
    data() {
      return {
        hostDetails: [],
        engineDetails: [],
        nodeDetails: [],
        nodeLabelColumns: [
          {
            title: '标签名',
            dataIndex: 'name',
            scopedSlots: { customRender: 'name' }
          },
          {
            title: '标签值',
            dataIndex: 'value',
            scopedSlots: { customRender: 'value' }
          },
          {
            title: '操作',
            dataIndex: 'action',
            scopedSlots: { customRender: 'action' },
            width: 130
          }
        ],
        nodeLabelData: [],
        originalNodeLabelData: [],
        changed: false,
        availability: null,
        role: null,
        version: null
      }
    },
    filters: {
      nodeStatus(text) {
        if (text === 'down' || text === 'Unhealthy') {
          return '#f50'
        }
        return '#87d068'
      }
    },
    methods: {
      loadNodeInfo() {
        const params = { nodeId: this.nodeId }
        invokeApi('/node/inspect', params).then(response => {
          if (response.code === 2000) {
            this.hostDetails = []
            this.hostDetails.push({
              label: '主机名',
              value: response.data.node['Description']['Hostname'] || null,
              prop: 'hostname'
            }, {
              label: '系统信息',
              value: response.data.node['Description']['Platform']['OS'] + ' ' + response.data.node['Description']['Platform']['Architecture'] || null,
              prop: 'os'
            }, {
              label: 'CPU核数',
              value: response.data.node['Description']['Resources']['NanoCPUs'] / 1e9 || null,
              prop: 'cpu'
            }, {
              label: '内存',
              value: convertSize(response.data.node['Description']['Resources']['MemoryBytes']) || null,
              prop: 'memory'
            })

            this.engineDetails = []
            this.engineDetails.push({
              label: '引擎版本',
              value: response.data.node['Description']['Engine']['EngineVersion'] || null,
              prop: 'version'
            }, {
              label: '存储卷插件',
              value: this.transformPlugins(response.data.node['Description']['Engine']['Plugins'], 'Volume').join(', ') || null,
              prop: 'volumePlugins'
            }, {
              label: '网络插件',
              value: this.transformPlugins(response.data.node['Description']['Engine']['Plugins'], 'Network').join(', ') || null,
              prop: 'networkPlugins'
            })

            this.nodeDetails = []
            this.nodeDetails.push({
              label: '节点角色',
              value: response.data.node['Spec']['Role'] + ' (' + response.data.node['ManagerStatus']['Addr'] + ')' || null,
              prop: 'role'
            }, {
              label: '节点可用性',
              value: response.data.node['Spec']['Availability'] || null,
              prop: 'availability'
            }, {
              label: '节点状态',
              value: response.data.node['Status']['State'] || null,
              prop: 'status'
            }, {
              label: '节点标签',
              value: response.data.node['Spec']['Labels'] || null,
              prop: 'labels'
            })
            this.renderNodeLabelData(response.data.node['Spec']['Labels'])
            this.version = response.data.node['Version']['Index']
            this.availability = response.data.node['Spec']['Availability']
            this.role = response.data.node['Spec']['Role']
          } else {
            this.$notification.warning({ message: '标题', description: '获取集群详细信息失败' })
          }
        }).catch(() => {
          this.$notification.error({ message: '错误', description: '获取集群详细信息异常' })
        })
      },
      transformPlugins(pluginsList, type) {
        return pluginsList.filter(plugin => plugin.Type === type).map(plugin => plugin.Name)
      },
      changedAvailability(availability) {
        this.availability = availability
        this.changed = true
      },
      renderNodeLabelData(labels) {
        this.nodeLabelData = []
        this.originalNodeLabelData = []
        Object.keys(labels).forEach(key => {
          const item = { name: key, value: labels[key] }
          item['editor'] = _.cloneDeep(item)
          item['editable'] = false
          this.nodeLabelData.push(item)
        })
        this.originalNodeLabelData = _.cloneDeep(this.nodeLabelData)
      },
      apply() {
        const labels = {}
        this.nodeLabelData.forEach(item => {
          labels[item.name] = item.value
        })
        const params = {
          nodeId: this.nodeId,
          role: this.role,
          availability: this.availability,
          labels: labels,
          version: this.version
        }
        invokeApi('/node/update', params).then(response => {
          if (response.code === 2000) {
            this.loadNodeInfo()
            this.changed = false
            this.$notification.success({ message: '标题', description: response.data })
          } else {
            this.$notification.warning({ message: '标题', description: response.data })
          }
        }).catch(() => {
          this.$notification.error({ message: '错误', description: '获取集群摘要信息异常' })
        })
      },
      reset() {
        this.changed = false
        this.nodeLabelData = _.cloneDeep(this.originalNodeLabelData)
      }
    },
    computed: {
      nodeId() {
        return this.$route.params.id
      }
    },
    mounted() {
      this.loadNodeInfo()
    }
  }
</script>

<style scoped lang="less">
</style>
