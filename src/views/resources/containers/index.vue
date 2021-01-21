<template>
  <page-view logo="https://gw.alipayobjects.com/zos/rmsportal/nxkuOJlFJuAUhzlMTCEe.png">
    <a-card :bordered="false">
      <div class="table-operator">
        <a-button icon="reload" @click="() => $refs['containersRef'].refresh()">刷新</a-button>
        <a-popconfirm :disabled="!selectedRows.length > 0" @confirm="removeContainer">
          <template slot="title">
            删除与容器关联的存储卷 <a-switch v-model="withVolumes" checkedChildren="开" unCheckedChildren="关"/>
          </template>
          <a-button type="danger" icon="delete" :disabled="!selectedRows.length > 0">删除</a-button>
        </a-popconfirm>
        <a-button type="primary" icon="plus" @click="() => this.$router.push({ path: 'containers/deploy' })">部署新容器</a-button>
      </div>

      <s-table ref="containersRef"
               :rowKey="record => record['Id']"
               size="middle"
               :scroll="{ x: 'calc(700px + 50%)'}"
               :columns="columns"
               :data="loadContainers"
               :alert="options.alert"
               :rowSelection="options.rowSelection">
        <!-- 容器名称/ID -->
        <template slot="Id" slot-scope="text, record">
          <router-link :to="{ path: `containers/${text}`, params: { containerId: text } }">
            {{ record['Names'][0].substring(1) | truncate(32) }}
          </router-link>
          <a-tooltip placement="right">
            <a-icon type="info-circle"/>
            <template slot="title">容器ID: {{ text }}</template>
          </a-tooltip>
        </template>
        <!-- 容器状态 -->
        <template slot="State" slot-scope="text">
          <a-badge :color="text | containerStatus('color')" :text="text | containerStatus('text')"/>
        </template>
        <!-- 应用栈 -->
        <template slot="Stack" slot-scope="text, record">
          {{ record['Labels'] | stackName }}
        </template>
        <!-- 镜像名称 -->
        <template slot="Image" slot-scope="text, record">
          <router-link :to="{ path: `images/${record['ImageID'].replace('sha256:', '')}`,
                              params: { imageId: record['ImageID'].replace('sha256:', '') } }">
            {{ text | trimShaSum }}
          </router-link>
        </template>
        <!-- IP -->
        <template slot="IP" slot-scope="text, record">
          {{ record['NetworkSettings'] | ipAddr }}
        </template>
        <!-- 发布端口 -->
        <template slot="Ports" slot-scope="text">
          <a v-for="port in text"
             v-if="port['IP'] !== null && port['PublicPort'] !== null"
             :key="port['PrivatePort']"
             :href="`http://${port['IP']}:${port['PublicPort']}`"
             target="_blank">
            <a-icon type="global"/>
            {{ `${port['PublicPort']}:${port['PrivatePort']}` }}
          </a>
        </template>
        <!-- 创建时间 -->
        <template slot="Created" slot-scope="text">
          {{ text * 1000 | moment }}
        </template>
        <!-- 操作列-->
        <template slot="action" slot-scope="text, record">
          <a @click="logs(record['Id'])">日志</a>
          <a-divider type="vertical"/>
          <a @click="inspect(record['Id'])">摘要</a>
          <a-divider type="vertical"/>
          <a v-if="record['State'] === 'running'" @click="monitor(record['Id'])">监控</a>
          <a-divider v-if="record['State'] === 'running'" type="vertical"/>
          <a v-if="record['State'] === 'running'" @click="terminal(record['Id'])">终端</a>
          <a-divider v-if="record['State'] === 'running'" type="vertical"/>
          <a-dropdown>
            <a-icon style="cursor: pointer;color: #096dd9" type="more"/>
            <a-menu slot="overlay">
              <a-menu-item @click="changeContainerStatus(record['Id'], 'start')"><a-icon type="reload"/>启动</a-menu-item>
              <a-menu-item @click="changeContainerStatus(record['Id'], 'stop')"><a-icon type="stop"/>停止</a-menu-item>
              <a-menu-item @click="changeContainerStatus(record['Id'], 'kill')"><a-icon type="poweroff"/>杀死</a-menu-item>
              <a-menu-item @click="changeContainerStatus(record['Id'], 'restart')"><a-icon type="sync"/>重启</a-menu-item>
              <a-menu-item @click="changeContainerStatus(record['Id'], 'pause')"><a-icon type="pause"/>暂停</a-menu-item>
              <a-menu-item @click="changeContainerStatus(record['Id'], 'upPause')"><a-icon type="thunderbolt"/>恢复</a-menu-item>
            </a-menu>
          </a-dropdown>
        </template>
      </s-table>
    </a-card>
    <!-- 容器摘要 -->
    <coco-json-viewer :visible="visibleInspect"
                      :title="'容器摘要'"
                      :inspect="containerInspect"
                      @close="() => {this.visibleInspect = false}"
                      ref="containerInspectRef"/>

    <!-- 容器日志 -->
    <coco-logs :visible="visibleLogs"
               :title="'容器日志'"
               :logs="containerLogs"
               @close="() => this.visibleLogs = false"
               ref="containerLogsRef"/>
    <!-- 容器终端 -->
    <coco-web-terminal :visible="visibleTerminal"
                       :title="'容器终端'"
                       :socket="this.$socket"
                       :send-socket-event="sendSocketEvent"
                       :extend-params="extendParams"
                       @close="() => this.visibleTerminal = false"
                       ref="containerTerminalRef"/>
  </page-view>
</template>

<script>
  import { PageView, RouteView } from '@/layouts'
  import { STable, JsonViewer, CocoLogs, CocoJsonViewer, CocoWebTerminal } from '@/components'
  import DetailList from '@/components/tools/DetailList'
  import ContainerDeploy from './deploy'
  import { invokeApi } from '@api/http'

  const DetailListItem = DetailList.Item

  export default {
    name: 'Containers',
    components: {
      PageView,
      RouteView,
      STable,
      JsonViewer,
      DetailList,
      DetailListItem,
      CocoLogs,
      CocoJsonViewer,
      CocoWebTerminal,
      ContainerDeploy
    },
    data() {
      return {
        sendSocketEvent: 'containerTerminal',
        extendParams: {},
        queryParam: {},
        columns: [
          {
            title: '容器名称/ID',
            dataIndex: 'Id',
            sorter: true,
            scopedSlots: { customRender: 'Id' },
            ellipsis: true,
            width: 250
          },
          {
            title: '状态',
            dataIndex: 'State',
            sorter: true,
            scopedSlots: { customRender: 'State' },
            filters: [
              { text: '运行中', value: 'running' },
              { text: '已停止', value: 'stop' },
              { text: '已退出', value: 'exited' }
            ],
            width: 100
          },
          {
            title: '应用栈',
            dataIndex: 'Stack',
            sorter: true,
            scopedSlots: { customRender: 'Stack' },
            ellipsis: true
          },
          {
            title: '镜像名称',
            dataIndex: 'Image',
            sorter: true,
            scopedSlots: { customRender: 'Image' },
            ellipsis: true
          },
          {
            title: 'IP',
            dataIndex: 'IP',
            sorter: true,
            scopedSlots: { customRender: 'IP' },
            width: 120
          },
          {
            title: '发布端口',
            dataIndex: 'Ports',
            sorter: true,
            scopedSlots: { customRender: 'Ports' },
            ellipsis: true
          },
          {
            title: '创建时间',
            dataIndex: 'Created',
            sorter: true,
            scopedSlots: { customRender: 'Created' },
            width: 150
          },
          {
            title: '操作',
            dataIndex: 'action',
            scopedSlots: { customRender: 'action' },
            width: 230
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
        withVolumes: false,
        visibleInspect: false,
        containerInspect: {},
        visibleLogs: false,
        containerLogs: null,
        visibleTerminal: false,
        currContainerTerminal: null
      }
    },
    filters: {
      containerStatus(text, mode) {
        const status = _.toLower(text)
        switch (status) {
          case 'paused':
            return mode === 'text' ? '已暂停' : '#d9d9d9'
          case 'dead':
            return mode === 'text' ? '已失活' : '#f5222d'
          case 'created':
            return mode === 'text' ? '已创建' : '#5bc0de'
          case 'exited':
            return mode === 'text' ? '已停止' : '#f5222d'
          case '(healthy)':
            return mode === 'text' ? '健康的' : '#52c41a'
          case '(unhealthy)':
            return mode === 'text' ? '不良的' : '#faad14'
          case '(health: starting)':
            return mode === 'text' ? '启动中' : '#1890ff'
          default:
            return mode === 'text' ? '运行中' : '#52c41a'
        }
      },
      stackName(label) {
        let stack = '-'
        if (label && label['com.docker.compose.project']) {
          stack = label['com.docker.compose.project']
        } else if (label && label['com.docker.stack.namespace']) {
          stack = label['com.docker.stack.namespace']
        }
        return stack
      },
      ipAddr(networkSettings) {
        let ip = null
        if (networkSettings && !_.isEmpty(networkSettings['Networks'])) {
          ip = networkSettings['Networks'][Object.keys(networkSettings['Networks'])[0]]['IPAddress']
        }
        return _.isEmpty(ip) ? '-' : ip
      }
    },
    methods: {
      loadContainers(params) {
        params['filter'] = { all: true }
        return invokeApi('/container/list', { ...params, ...this.queryParam }).then(response => {
          if (response.code === 2000) {
            return response.data
          } else {
            this.$notification.warning({ message: '失败', description: response.data })
          }
        })
      },
      onSelectChange(selectedRowKeys, selectedRows) {
        this.selectedRowKeys = selectedRowKeys
        this.selectedRows = selectedRows
      },
      logs(containerId) {
        const logsConfig = this.$refs['containerLogsRef'].logsForm.getFieldsValue()
        this.visibleLogs = true
        const params = {
          containerId: containerId,
          follow: false,
          tail: _.isEmpty(logsConfig['tail']) ? 100 : logsConfig['tail'],
          timestamps: _.isEmpty(logsConfig['timestamps']) ? false : logsConfig['timestamps'],
          timeFetch: _.isEmpty(logsConfig['timeFetch']) ? 'all' : logsConfig['timeFetch']
        }
        const autoRefresh = _.isEmpty(logsConfig['autoRefresh']) ? false : logsConfig['autoRefresh']
        console.log('autoRefresh', autoRefresh)
        if (autoRefresh) {
          setTimeout(() => {
            invokeApi('/container/logs', params).then(response => {
              if (response.code === 2000) {
                this.containerLogs = response.data.split('\n')
              } else {
                this.$notification.warning({ message: '失败', description: response.data })
              }
            }).catch(error => {
              this.$notification.error({ message: '错误', description: error })
            })
          }, 5 * 1000)
        } else {
          invokeApi('/container/logs', params).then(response => {
            if (response.code === 2000) {
              this.containerLogs = response.data.split('\n')
            } else {
              this.$notification.warning({ message: '失败', description: response.data })
            }
          }).catch(error => {
            this.$notification.error({ message: '错误', description: error })
          })
        }
      },
      inspect(containerId) {
        this.visibleInspect = true
        const params = {
          containerId: containerId
        }
        invokeApi('/container/inspect', params).then(response => {
          if (response.code === 2000) {
            this.containerInspect = response.data
          } else {
            this.$notification.warning({ message: '失败', description: response.data })
          }
        }).catch((error) => {
          this.$notification.error({ message: '错误', description: error })
        })
      },
      monitor(containerId) {
        this.$router.push({
          path: `/resources/containers/${containerId}/statistics`,
          params: { containerId: containerId }
        })
      },
      terminal(containerId) {
        this.visibleTerminal = true
        this.currContainerTerminal = containerId
        this.extendParams = {
          containerId: containerId
        }
        this.$socket.emit('containerTerminal', this.extendParams)
      },
      // 变更容器状态
      changeContainerStatus(containerId, action) {
        const params = {
          containerId: containerId,
          action: action
        }
        invokeApi('/container/updateStatus', params).then(response => {
          if (response.code === 2000) {
            this.$notification.success({ message: '成功', description: response.data })
          } else {
            this.$notification.warning({ message: '失败', description: response.data })
          }
        }).catch((error) => {
          this.$notification.error({ message: '错误', description: error })
        }).finally(() => {
          this.$refs['containersRef'].refresh()
        })
      },
      // 删除容器
      removeContainer() {
        this.selectedRows.forEach(item => {
          const params = {
            containerId: item.Id,
            withVolumes: this.withVolumes
          }
          invokeApi('/container/remove', params).then(response => {
            if (response.code === 2000) {
              this.$notification.success({ message: '成功', description: response.data })
              this.selectedRows = []
              this.selectedRowKeys = []
              this.$refs['containersRef'].selectedRowKeys = []
              this.$refs['containersRef'].selectedRows = []
            } else {
              this.$notification.warning({ message: '失败', description: response.data })
            }
          }).catch((error) => {
            this.$notification.error({ message: '错误', description: error })
          }).finally(() => {
            this.$refs['containersRef'].refresh()
          })
        })
      },
      delegateSocketEvent() {
        this.sockets.listener.subscribe('terminal', (data) => {
          if (data.indexOf('exit') >= 0) {
            const params = { 'containerId': this.currContainerTerminal }
            this.$socket.emit('closeContainerTerminal', params)
          }
        })
      }
    },
    mounted() {
      this.delegateSocketEvent()
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
</style>
