<template>
  <page-view logo="https://gw.alipayobjects.com/zos/rmsportal/nxkuOJlFJuAUhzlMTCEe.png">
    <detail-list slot="headerContent" size="small" :col="2" class="detail-layout">
      <detail-list-item v-for="(desc, index) in detailsOption.status"
                        :key="index"
                        :term="desc.label">
        {{ desc.value }}
      </detail-list-item>
    </detail-list>
    <template slot="headerContent">
      <a-button type="link" icon="file-text" @click="loadContainerLogs">日志</a-button>
      <a-divider type="vertical" />
      <a-button type="link" icon="exclamation-circle" @click="() => this.visibleInspect = true">摘要</a-button>
      <a-divider type="vertical" />
      <a-button type="link" icon="area-chart" @click="displayContainerStats">监控统计</a-button>
      <a-divider type="vertical" />
      <a-button type="link" icon="code">终端控制台</a-button>
    </template>
    <template slot="action">
      <a-button-group style="margin-right: 4px;">
        <a-button icon="reload" size="small" @click.stop="changeContainerStatus('start')">启动</a-button>
        <a-button icon="stop" size="small" type="danger" @click.stop="changeContainerStatus('stop')">停止</a-button>
        <a-button icon="poweroff" size="small" type="danger" @click.stop="changeContainerStatus('kill')">杀死</a-button>
        <a-button icon="sync" size="small" @click.stop="changeContainerStatus('restart')">重启</a-button>
        <a-button icon="pause" size="small" @click.stop="changeContainerStatus('pause')">暂停</a-button>
        <a-button icon="thunderbolt" size="small" @click.stop="changeContainerStatus('upPause')">恢复</a-button>
        <a-popconfirm @confirm="removeContainer">
          <template slot="title">
            删除与容器关联的存储卷 <a-switch v-model="withVolumes" checkedChildren="开" unCheckedChildren="关"/>
          </template>
          <a-button type="danger" icon="delete" size="small">删除</a-button>
        </a-popconfirm>
      </a-button-group>
    </template>

    <a-card :bordered="false" style="margin-bottom: 20px;">
      <template slot="title"><a-icon type="bars"/> 容器详情</template>
      <a-list size="small" :dataSource="detailsOption.details">
        <a-list-item slot="renderItem" slot-scope="item">
          <a-col span="2">{{ item.label }}</a-col>
          <a-col span="22">
            <template v-if="item.prop === 'image'">
              <router-link :to="{ path: `/resources/images/${item.value.split('@sha256:').slice(-1).join(',')}`,
                                  params: { imageId: item.value.split('@sha256:').slice(-1).join(',') } }">
                {{ item.value }}
              </router-link>
            </template>
            <template v-else-if="item.prop === 'ports'">
              <div v-for="port in item.value" :key="port.container">
                <span>{{ port.host }}<a-icon type="swap-right"/>{{ port.container }}</span>
                <br>
              </div>
            </template>
            <template v-else-if="item.prop === 'entrypoint'">
              <a-tag v-for="entrypoint in item.value" :key="entrypoint">{{ entrypoint }}</a-tag>
            </template>
            <template v-else-if="item.prop === 'cmds'">
              <a-tag v-for="cmd in item.value" :key="cmd">{{ cmd }}</a-tag>
            </template>
            <template v-else-if="item.prop === 'envs'">
              <a-table :show-header="false"
                       :columns="kvColumns"
                       :dataSource="item.value"
                       :pagination="false"
                       :size="'small'"
                       style="width: 100%"/>
            </template>
            <template v-else-if="item.prop === 'labels'">
              <coco-shield v-for="label in Object.keys(item.value)"
                           :key="label"
                           :label="label"
                           style="display: table">
                {{ item.value[label] }}
              </coco-shield>
            </template>
            <template v-else>{{ item.value }}</template>
          </a-col>
        </a-list-item>
      </a-list>
    </a-card>

    <a-card :bordered="false" style="margin-bottom: 20px;" class="compact">
      <template slot="title"><a-icon type="bars"/> 存储卷</template>
      <a-table :columns="volumesOption.columns"
               :dataSource="volumesOption.data"
               :pagination="false">
        <!-- 卷名称 -->
        <template slot="Source" slot-scope="text, record">
          <span v-if="record['Type'] === 'volume'">
            <router-link :to="{ path: `/resources/volumes/${record['Name']}`, params: { volumeName: record['Name'] } }">
              {{ record['Name'] }}
            </router-link>
          </span>
          <span style="margin-right: 5px;" v-else>{{ text }}</span>
          <a-tooltip placement="right">
            <a-icon type="info-circle"/>
            <template slot="title">宿主机映射路径: {{ record['Source'] }}</template>
          </a-tooltip>
        </template>
        <!-- 读写权限 -->
        <template slot="RW" slot-scope="text">
          <a-switch :disabled="true" :defaultChecked="text !== null && text === true">
            <a-icon type="check" slot="checkedChildren"/>
            <a-icon type="close" slot="unCheckedChildren"/>
          </a-switch>
        </template>
      </a-table>
    </a-card>

    <a-card :bordered="false" style="margin-bottom: 20px;" class="compact">
      <template slot="title"><a-icon type="bars"/> 连接网络</template>
      <template slot="extra">
        <a-select placeholder="请选择要加入的网络"
                  size="small"
                  style="width: 200px; margin-right: 5px;"
                  @change="changedNetwork">
          <a-select-option v-for="network in networks"
                           :key="network['Id']"
                           :value="network['Id']">
            {{ network['Name'] }}
          </a-select-option>
        </a-select>
        <a-button size="small" icon="plus" @click="joinNetwork">加入网络</a-button>
      </template>
      <a-table :columns="networksOption.columns"
               :dataSource="networksOption.data"
               :pagination="false">
        <!-- 网络名称 -->
        <template slot="Network" slot-scope="text, record">
          <router-link :to="{ path: `/resources/networks/${record['NetworkID']}`, params: { networkID: record['NetworkID'] } }">
            {{ text }}
          </router-link>
        </template>
        <!-- 操作列-->
        <template slot="action" slot-scope="text, record">
          <a-button icon="minus-circle" type="danger" size="small" @click="leaveNetwork(record['NetworkID'])">离开网络</a-button>
        </template>
      </a-table>
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
  </page-view>
</template>

<script>
  import { PageView } from '@/layouts'
  import { DetailList, CocoJsonViewer, CocoLogs, CocoShield } from '@/components'
  import { common, containers } from '@/mixins'
  import { invokeApi } from '@api/http'
  import { isNotEmpty, isNotString } from '@/utils/util'

  const DetailListItem = DetailList.Item

  export default {
    name: 'ContainersDetails',
    components: {
      PageView,
      DetailList,
      DetailListItem,
      CocoShield,
      CocoLogs,
      CocoJsonViewer
    },
    mixins: [common.base, common.logs, containers.details, containers.inspect],
    data() {
      return {
        withVolumes: false,
        visibleInspect: false,
        containerInspect: null,
        containerLogs: null,
        visibleLogs: false,
        selectedNetwork: null,
        networks: null
      }
    },
    methods: {
      // 变更容器状态
      changeContainerStatus(action) {
        const params = {
          containerId: this.containerId,
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
        })
      },
      // 删除容器
      removeContainer() {
        const params = {
          containerId: this.containerId,
          withVolumes: this.withVolumes
        }
        invokeApi('/container/remove', params).then(response => {
          if (response.code === 2000) {
            this.$notification.success({ message: '成功', description: response.data })
          } else {
            this.$notification.warning({ message: '失败', description: response.data })
          }
        }).catch((error) => {
          this.$notification.error({ message: '错误', description: error })
        }).finally(() => {
          this.$router.push('/resources/containers')
        })
      },
      // 获取容器摘要
      loadContainerInspect(params, force = false) {
        if (force || this.containerInspect === null) {
          invokeApi('/container/inspect', params).then(response => {
            if (response.code === 2000) {
              this.containerInspect = response.data
              this.buildContainerStatus()
              this.buildContainerDetails()
              this.buildUsedVolumes()
              this.buildConnectedNetworks()
            }
          })
        }
      },
      // 展示容器监控统计信息
      displayContainerStats() {
        this.$router.push({
          name: 'ContainerStatistics',
          path: `/resources/containers/${this.containerId}/statistics`,
          params: { containerId: this.containerId }
        })
      },
      // 获取容器日志
      loadContainerLogs() {
        this.visibleLogs = true
        const params = {
          containerId: this.containerId,
          tail: 300
        }
        invokeApi('/container/logs', params).then(response => {
          if (response.code === 2000) {
            this.containerLogs = response.data.split('\n')
          } else {
            this.$notification.warning({ message: '失败', description: response.data })
          }
        }).catch((error) => {
          this.$notification.error({ message: '错误', description: error })
        })
      },
      connectContainerTerminal() {
        const params = {
          containerId: this.containerId
        }
        invokeApi('/container/exec', params)
      },
      // 加载容器网络
      loadNetworks() {
        invokeApi('/network/list', {}).then(response => {
          if (response.code === 2000) {
            this.networks = response.data.data.filter(item => {
              if (!this.networksOption.data.find(networkItem => networkItem['NetworkID'] === item['Id'])) {
                return item
              }
            })
          } else {
            this.$notification.error({ title: '加载容器网络发生异常' })
          }
        })
      },
      changedNetwork(networkId) {
        this.selectedNetwork = networkId
      },
      // 加入容器网络
      joinNetwork() {
        const params = {
          containerId: this.containerId,
          networkId: this.selectedNetwork
        }
        invokeApi('/network/join', params).then(response => {
          if (response.code === 2000) {
            this.$notification.success({ title: '成功加入网络' })
          } else {
            this.$notification.error({ title: '加入网络发生异常' })
          }
        })
      },
      // 离开容器网络
      leaveNetwork(networkId) {
        const params = {
          containerId: this.containerId,
          networkId: networkId
        }
        console.log(params)
        invokeApi('/network/leave', params).then(response => {
          if (response.code === 2000) {
            this.$notification.success({ title: '成功离开网络' })
          } else {
            this.$notification.error({ title: '离开网络发生异常' })
          }
        })
      },
      // 映射端口转换
      convertPorts(ports) {
        const portBindings = []
        Object.keys(ports).forEach(binding => {
          if (ports[binding] !== null && ports[binding].length > 0) {
            portBindings.push({
              container: binding,
              host: `${ports[binding][0]['HostIp']}:${ports[binding][0]['HostPort']}`
            })
          }
        })
        return portBindings
      },
      buildContainerStatus() {
        this.detailsOption.status = []
        this.detailsOption.status.push(
          {
            label: '容器名称',
            value: this.containerInspect['Name'].substring(1),
            prop: 'name'
          },
          {
            label: '容器状态',
            value: this.containerInspect['State']['Status'],
            prop: 'status'
          },
          {
            label: '启动时间',
            value: this.containerInspect['State']['StartedAt'],
            prop: 'started'
          },
          {
            label: '部署创建时间',
            value: this.containerInspect['Created'],
            prop: 'created'
          },
          {
            label: 'ID',
            value: this.containerInspect['Id'],
            prop: 'id'
          }
        )
      },
      buildUsedVolumes() {
        this.volumesOption.data = []
        this.containerInspect['Mounts'].forEach(item => {
          this.volumesOption.data.push({
            Name: item.Name,
            Type: item.Type,
            Source: item.Source,
            Destination: item.Destination,
            RW: item.RW,
            Driver: item.Driver
          })
        })
      },
      buildConnectedNetworks() {
        this.networksOption.data = []
        Object.keys(this.containerInspect['NetworkSettings']['Networks']).forEach(network => {
          this.networksOption.data.push({
            Network: network,
            NetworkID: this.containerInspect['NetworkSettings']['Networks'][network]['NetworkID'],
            IPAddress: this.containerInspect['NetworkSettings']['Networks'][network]['IPAddress'],
            MacAddress: this.containerInspect['NetworkSettings']['Networks'][network]['MacAddress'],
            Gateway: this.containerInspect['NetworkSettings']['Networks'][network]['Gateway']
          })
        })
      },
      buildContainerDetails() {
        this.detailsOption.details = []
        this.detailsOption.details.push({
          label: '镜像',
          value: `${this.containerInspect['Config']['Image']}@${this.containerInspect['Image']}`,
          prop: 'image'
        })
        if (isNotEmpty(Object.values(this.containerInspect['NetworkSettings']['Ports']).filter(item => isNotEmpty(item)))) {
          this.detailsOption.details.push({
            label: '映射端口',
            value: this.convertPorts(this.containerInspect['NetworkSettings']['Ports']),
            prop: 'ports'
          })
        }
        if (isNotString(this.containerInspect['Config']['Cmd'])) {
          this.detailsOption.details.push({
            label: '命令行',
            value: this.containerInspect['Config']['Cmd'],
            prop: 'cmds'
          })
        }
        if (isNotEmpty(this.containerInspect['Config']['Entrypoint'])) {
          this.detailsOption.details.push({
            label: '启动入口',
            value: this.containerInspect['Config']['Entrypoint'],
            prop: 'entrypoint'
          })
        }
        if (isNotEmpty(this.containerInspect['Config']['Env'])) {
          this.detailsOption.details.push({
            label: '环境变量',
            value: this.convertEnv(this.containerInspect['Config']['Env']),
            prop: 'envs'
          })
        }
        if (isNotEmpty(this.containerInspect['Config']['Labels'])) {
          this.detailsOption.details.push({
            label: '标签',
            value: this.containerInspect['Config']['Labels'],
            prop: 'labels'
          })
        }
      }
    },
    computed: {
      containerId() {
        return this.$route.params.id
      }
    },
    watch: {
      containerId: {
        deep: true,
        immediate: true,
        handler() {
          if (Object.keys(this.$route.params).includes('id')) {
            const params = { containerId: this.$route.params.id }
            this.loadContainerInspect(params, true)
            this.loadNetworks()
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
