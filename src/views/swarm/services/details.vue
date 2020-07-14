<template>
  <page-view>
    <a-row>
      <a-col span="18">
        <a-card :title="'服务详情'" :bordered="false" style="margin-bottom: 20px;" id="service-details">
          {{ details }}
        </a-card>
        <a-card :title="'容器规格'" :bordered="false" style="margin-bottom: 20px;" id="container-specification">
          {{ containerSpec }}
        </a-card>
        <a-card :title="'环境变量'" :bordered="false" style="margin-bottom: 20px;" class="compact" id="environment-variables">
          <a-table :columns="envs.columns"
                   :dataSource="envs.data"
                   :pagination="false">
            <template slot="action" slot-scope="text, record">
              <a-button icon="minus-circle" type="danger" size="small">移除</a-button>
            </template>
            <div slot="footer" style="text-align: right;">
              <a style="float:left;"><a-button type="primary" icon="check" size="small" style="margin-right: 5px">应用变更</a-button></a>
              <a><a-button shape="circle" type="primary" icon="plus" size="small" style="margin-right: 5px"></a-button>添加环境变量</a>
            </div>
          </a-table>
        </a-card>
        <a-card :title="'容器标签'" :bordered="false" style="margin-bottom: 20px;" class="compact">
          <a-table :columns="containerLabels.columns"
                   :dataSource="containerLabels.data"
                   :pagination="false">
            <template slot="action" slot-scope="text, record">
              <a-button icon="minus-circle" type="danger" size="small">移除</a-button>
            </template>
            <div slot="footer" style="text-align: right;">
              <a style="float:left;"><a-button type="primary" icon="check" size="small" style="margin-right: 5px">应用变更</a-button></a>
              <a><a-button shape="circle" type="primary" icon="plus" size="small" style="margin-right: 5px"></a-button>添加容器标签</a>
            </div>
          </a-table>
        </a-card>
        <a-card :title="'卷挂载'" :bordered="false" style="margin-bottom: 20px;" class="compact">
          <a-table :columns="mounts.columns"
                   :dataSource="mounts.data"
                   :pagination="false">
            <template slot="ReadOnly" slot-scope="text, record">
              <a-switch :defaultChecked="text !== null && text === true">
                <a-icon type="check" slot="checkedChildren"/>
                <a-icon type="close" slot="unCheckedChildren"/>
              </a-switch>
            </template>
            <template slot="action" slot-scope="text, record">
              <a-button icon="minus-circle" type="danger" size="small">移除</a-button>
            </template>
            <div slot="footer" style="text-align: right;">
              <a style="float:left;"><a-button type="primary" icon="check" size="small" style="margin-right: 5px">应用变更</a-button></a>
              <a><a-button shape="circle" type="primary" icon="plus" size="small" style="margin-right: 5px;"></a-button>添加环境变量</a>
            </div>
          </a-table>
        </a-card>
        <a-card :title="'网络'" :bordered="false" style="margin-bottom: 20px;">
          {{ networks }}
        </a-card>
        <a-card :title="'端口映射'" :bordered="false" style="margin-bottom: 20px;">
        </a-card>
        <a-card :title="'资源限制与配额'" :bordered="false" style="margin-bottom: 20px;">
        </a-card>
        <a-card :title="'约束条件'" :bordered="false" style="margin-bottom: 20px;">
          {{ placementConstraints }}
        </a-card>
        <a-card :title="'重启策略'" :bordered="false" style="margin-bottom: 20px;">
          {{ restartPolicy }}
        </a-card>
        <a-card :title="'更新配置'" :bordered="false" style="margin-bottom: 20px;">
        </a-card>
        <a-card :title="'日志驱动'" :bordered="false" style="margin-bottom: 20px;">
        </a-card>
        <a-card :title="'服务标签'" :bordered="false" style="margin-bottom: 20px;">
          {{ serviceLabels }}
        </a-card>
        <a-card :title="'配置项'" :bordered="false" style="margin-bottom: 20px;">
          {{ configs }}
        </a-card>
        <a-card :title="'加密配置项'" :bordered="false" style="margin-bottom: 20px;">
          {{ secrets }}
        </a-card>
        <a-card :title="'任务详情'" :bordered="false" >
          <s-table rowKey="key"
                   size="middle"
                   :columns="taskColumns"
                   :data="loadTasks"
                   :showPagination="false"
                   :alert="null"
                   :rowSelection="null">
            <template slot="Status" slot-scope="text, record">
              <template>
                <a-tag :color="taskState[record['Status']['State']]['color']">
                  {{ taskState[record['Status']['State']]['alias'] }}
                </a-tag>
                <a-tooltip v-if="['failed', 'rejected'].includes(record['Status']['State'])" placement="right">
                  <a-icon type="info-circle"/>
                  <template slot="title">
                    调度异常信息: {{ record['Status'][taskState[record['Status']['State']]['tip']] }}
                  </template>
                </a-tooltip>
              </template>
            </template>
            <template slot="UpdatedAt" slot-scope="text">
              {{ text | moment }}
            </template>
            <template slot="action" slot-scope="text, record">
              <a @click="logs(record.Id)">日志</a>
              <a-divider type="vertical"/>
              <a @click="inspect(record.Id)">摘要</a>
              <a-divider v-if="record['Status']['State'] === 'running'" type="vertical"/>
              <a v-if="record['Status']['State'] === 'running'" @click="monitor(record.Id)">监控</a>
              <a-divider v-if="record['Status']['State'] === 'running'" type="vertical"/>
              <a v-if="record['Status']['State'] === 'running'" @click="terminal(record.Id)">终端</a>
            </template>
          </s-table>
        </a-card>
      </a-col>
      <a-col offset="1" span="5">
        <a-anchor :showInkInFixed="true" :offsetTop="165" style="max-height: calc(100vh - 100px);">
          <a-anchor-link href="#service-details" title="服务详情"/>
          <a-anchor-link href="#container-specification" title="容器规格"/>
          <a-anchor-link href="#environment-variables" title="环境变量"/>
        </a-anchor>
      </a-col>
    </a-row>
  </page-view>
</template>

<script>
  import { PageView } from '@/layouts'
  import { STable } from '@/components'
  import { invokeApi } from '@api/http'

  export default {
    name: 'ServiceDetails',
    components: {
      PageView,
      STable
    },
    data() {
      return {
        envs: {
          columns: [
            {
              title: '标签',
              dataIndex: 'Label',
              sorter: true,
              scopedSlots: { customRender: 'Label' }
            },
            {
              title: '值',
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
          data: []
        },
        containerLabels: {
          columns: [
            {
              title: '变量项',
              dataIndex: 'Label',
              sorter: true,
              scopedSlots: { customRender: 'Label' }
            },
            {
              title: '值',
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
          data: []
        },
        mounts: {
          columns: [
            {
              title: '类型',
              dataIndex: 'Type',
              sorter: true,
              scopedSlots: { customRender: 'Type' }
            },
            {
              title: '容器挂载路径/卷',
              dataIndex: 'Source',
              sorter: true,
              scopedSlots: { customRender: 'Source' }
            },
            {
              title: '宿主机映射路径',
              dataIndex: 'Target',
              sorter: true,
              scopedSlots: { customRender: 'Target' }
            },
            {
              title: '读写权限',
              dataIndex: 'ReadOnly',
              sorter: true,
              scopedSlots: { customRender: 'ReadOnly' }
            },
            {
              title: '操作',
              dataIndex: 'action',
              width: 150,
              scopedSlots: { customRender: 'action' }
            }
          ],
          data: []
        },
        taskColumns: [
          {
            title: '状态',
            dataIndex: 'Status',
            sorter: true,
            scopedSlots: { customRender: 'Status' }
          },
          {
            title: '调度任务ID',
            dataIndex: 'ID',
            sorter: true,
            scopedSlots: { customRender: 'ID' }
          },
          {
            title: '集群调度节点',
            dataIndex: 'NodeID',
            sorter: true,
            scopedSlots: { customRender: 'NodeID' }
          },
          {
            title: '更新时间',
            dataIndex: 'UpdatedAt',
            sorter: true,
            scopedSlots: { customRender: 'UpdatedAt' }
          },
          {
            title: '操作',
            dataIndex: 'action',
            width: 180,
            scopedSlots: { customRender: 'action' }
          }
        ],
        taskState: {
          failed: { alias: '任务调度失败', color: '#f50', tip: 'Err' },
          rejected: { alias: '任务调度被拒绝', color: '#f50', tip: 'Err' },
          running: { alias: '任务运行中', color: '#87d068', tip: '' },
          complete: { alias: '任务调度完成', color: '#108ee9', tip: '' },
          shutdown: { alias: '任务已关闭', color: '#f50', tip: '' }
        },

        // custom table alert & rowSelection
        options: {
          alert: {
            show: true,
            clear: () => {
              this.selectedRowKeys = []
            }
          },
          rowSelection: {
            selectedRowKeys: this.selectedRowKeys,
            onChange: this.onSelectChange
          }
        },
        details: {},
        containerSpec: {},
        networks: [],
        serviceLabels: [],
        restartPolicy: [],
        placementConstraints: [],
        configs: [],
        secrets: []
      }
    },
    methods: {
      terminal(containerId) {
        console.log(containerId)
      },
      monitor(containerId) {
        console.log(containerId)
      },
      logs(taskId) {
        console.log(taskId)
      },
      inspect(taskId) {
        console.log(taskId)
      },
      loadService() {
        return invokeApi('/service/inspect', { serviceId: this.serviceId }).then(response => {
          if (response.code === 2000) {
            console.log('loadService->', response.data)
            this.details['ID'] = response.data['ID']
            this.details['Image'] = response.data['Spec']['TaskTemplate']['ContainerSpec']['Image']
            this.details['CreatedAt'] = response.data['CreatedAt']
            this.details['UpdatedAt'] = response.data['UpdatedAt']
            this.details['Name'] = response.data['Spec']['Name']
            this.containerSpec['cmd'] = response.data['Spec']['TaskTemplate']['ContainerSpec']['Command']
            const tmp = response.data['Spec']['TaskTemplate']['ContainerSpec']['Labels']
            Object.keys(tmp).forEach(key => {
              this.containerLabels['data'].push({
                Label: key,
                Value: tmp[key]
              })
            })
            // Envs
            response.data['Spec']['TaskTemplate']['ContainerSpec']['Env'].forEach(item => {
              this.envs['data'].push({
                Label: item.split('=')[0],
                Value: item.split('=')[1]
              })
            })
            this.mounts['data'] = response.data['Spec']['TaskTemplate']['ContainerSpec']['Mounts']
            this.secrets = response.data['Spec']['TaskTemplate']['ContainerSpec']['Secrets']
            this.restartPolicy = response.data['Spec']['TaskTemplate']['RestartPolicy']
            this.placementConstraints = response.data['Spec']['TaskTemplate']['Placement']['Constraints']
            this.networks = response.data['Spec']['Networks']
            this.serviceLabels = response.data['Spec']['Labels']
            this.configs = response.data['Spec']['TaskTemplate']['ContainerSpec']['Configs']
            this.secrets = response.data['Spec']['TaskTemplate']['ContainerSpec']['Secrets']
            return response.data
          } else {
            this.$notification.error({
              message: '标题',
              description: '加载数据失败'
            })
          }
        })
      },
      loadTasks(params) {
        params['serviceId'] = this.serviceId
        params['groupBy'] = true
        return invokeApi('/task/list', params).then(response => {
          if (response.code === 2000) {
            return response.data
          } else {
            this.$notification.error({
              message: '标题',
              description: '加载数据失败'
            })
          }
        })
      }
    },
    computed: {
      serviceId() {
        return this.$route.params.id
      }
    },
    watch: {
      serviceId: {
        deep: true,
        immediate: true,
        handler() {
          if (Object.keys(this.$route.params).includes('id')) {
            this.loadService()
          }
        }
      }
    }
  }
</script>

<style scoped lang="less">
  /deep/ .compact .ant-card-body {
    padding: 0;
  }
</style>
