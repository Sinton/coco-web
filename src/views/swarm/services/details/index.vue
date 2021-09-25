<template>
  <page-view>
    <a-collapse :bordered="false" style="margin-bottom: 25px">
      <a-collapse-panel v-for="faq in faqs"
                        :key="faq.id"
                        :header="faq.header">
        <p>{{ faq.content }}</p>
      </a-collapse-panel>
    </a-collapse>
    <a-card :bordered="false" style="margin-bottom: 20px;">
      <template slot="title"><a-icon type="bars"/> 服务详情</template>
      <a-list size="small" :dataSource="details">
        <a-list-item slot="renderItem" slot-scope="item">
          <a-col span="2">{{ item.label }}</a-col>
          <a-col span="22">
            <template v-if="item.prop === 'Name'">
              {{ item.value }}
              <a-tooltip :title="serviceId">
                <a-icon type="info-circle"/>
              </a-tooltip>
            </template>
            <template v-else-if="item.prop === 'Image'">
              <!-- TODO 双击出现修改框 -->
              <a-input v-model="item.value" placeholder="请输入要升级的镜像版本"/>
            </template>
            <template v-else>{{ item.value }}</template>
          </a-col>
        </a-list-item>
      </a-list>
      <a-button type="link" icon="file-text" style="margin-right: 5px;">查看日志</a-button>
      <a-divider type="vertical" />
      <a-button type="link" icon="reload" style="margin-right: 5px;">更新服务</a-button>
      <a-divider type="vertical" />
      <a-button type="link" icon="delete" style="margin-right: 5px;">删除服务</a-button>
      <a-divider type="vertical" />
      <a-button type="link" icon="exclamation-circle" @click="inspectService">摘要</a-button>
    </a-card>
    <details-service-container-spec :data="containerSpec"/>
    <details-service-service-envs :id="serviceId" :data="envs"/>
    <details-service-container-labels :id="serviceId" :data="containerLabels"/>
    <details-service-service-volumes :id="serviceId" :data="volumes"/>
    <service-networks :data="networks"/>
    <details-service-service-ports :id="serviceId" :data="ports"/>
    <details-service-resources :id="serviceId" :data="resources"/>
    <details-service-placement-constraints :id="serviceId" :data="placementConstraints"/>
    <details-service-restart-policy :id="serviceId" :data="restartPolicy"/>
    <details-service-update-config :id="serviceId" :data="updateConfig"/>
    <details-service-service-labels :id="serviceId" :data="serviceLabels"/>
    <details-service-configs :id="serviceId" :data="configs"/>
    <service-secrets :id="serviceId" :data="secrets"/>
    <service-tasks :service-id="serviceId"/>

    <!-- 服务摘要 -->
    <coco-json-viewer :visible="visibleInspect"
                      :title="'容器摘要'"
                      :inspect="serviceInspect"
                      @close="() => {this.visibleInspect = false}"
                      ref="serviceInspectRef"/>
  </page-view>
</template>

<script>
  import { PageView } from '@/layouts'
  import { STable, CocoJsonViewer } from '@/components'
  import DetailsServiceContainerSpec from '@views/swarm/services/details/containerSpec'
  import DetailsServiceServiceEnvs from '@views/swarm/services/details/envs'
  import DetailsServiceContainerLabels from '@views/swarm/services/details/containerLabels'
  import DetailsServiceServiceVolumes from '@views/swarm/services/details/volumes'
  import ServiceNetworks from '@views/swarm/services/details/networks'
  import DetailsServiceServicePorts from '@views/swarm/services/details/ports'
  import DetailsServiceResources from '@views/swarm/services/details/resources'
  import DetailsServicePlacementConstraints from '@views/swarm/services/details/placementConstraints'
  import DetailsServiceRestartPolicy from '@views/swarm/services/details/restartPolicy'
  import DetailsServiceUpdateConfig from '@views/swarm/services/details/updateConfig'
  import DetailsServiceServiceLabels from '@views/swarm/services/details/serviceLabels'
  import DetailsServiceConfigs from '@views/swarm/services/details/configs'
  import ServiceSecrets from '@views/swarm/services/details/secrets'
  import ServiceTasks from '@views/swarm/services/details/tasks'
  import { dateFormat, isEmpty } from '@/utils/util'
  import { invokeApi } from '@api/http'
  import { services } from '@/mixins'

  export default {
    name: 'ServiceDetails',
    components: {
      DetailsServiceContainerSpec,
      DetailsServiceServiceEnvs,
      DetailsServiceContainerLabels,
      DetailsServiceServiceVolumes,
      ServiceNetworks,
      DetailsServiceServicePorts,
      DetailsServiceResources,
      DetailsServicePlacementConstraints,
      DetailsServiceRestartPolicy,
      DetailsServiceUpdateConfig,
      DetailsServiceServiceLabels,
      DetailsServiceConfigs,
      ServiceSecrets,
      ServiceTasks,
      PageView,
      STable,
      CocoJsonViewer
    },
    mixins: [services.faq],
    data() {
      return {
        details: [],
        containerSpec: {},
        envs: [],
        containerLabels: {},
        volumes: [],
        networks: [],
        ports: [],
        resources: {},
        placementConstraints: [],
        restartPolicy: {},
        updateConfig: {},
        serviceLabels: {},
        configs: [],
        secrets: [],
        serviceInspect: {},
        visibleInspect: false,

        // custom table alert & rowSelection
        options: {
          alert: { show: true, clear: () => { this.selectedRowKeys = [] } },
          rowSelection: {
            selectedRows: this.selectedRows,
            selectedRowKeys: this.selectedRowKeys,
            onChange: this.onSelectChange
          }
        }
      }
    },
    methods: {
      loadService() {
        invokeApi('/service/inspect', { serviceId: this.serviceId }).then(response => {
          if (response.code === 2000) {
            // 详情
            this.details = []
            this.details.push(
              { prop: 'Name', label: '名称', value: response.data['Spec']['Name'] },
              { prop: 'Image', label: '镜像', value: response.data['Spec']['TaskTemplate']['ContainerSpec']['Image'] },
              { prop: 'CreatedAt', label: '创建时间', value: dateFormat(response.data['CreatedAt']) },
              { prop: 'UpdatedAt', label: '更新时间', value: dateFormat(response.data['UpdatedAt']) },
              { prop: 'Version', label: '版本', value: response.data['Version']['Index'] }
            )
            // 容器规格
            this.containerSpec = response.data['Spec']['TaskTemplate']['ContainerSpec']
            // 环境变量
            this.envs = response.data['Spec']['TaskTemplate']['ContainerSpec']['Env']
            // 容器标签
            this.containerLabels = response.data['Spec']['TaskTemplate']['ContainerSpec']['Labels']
            // 存储卷
            this.volumes = response.data['Spec']['TaskTemplate']['ContainerSpec']['Mounts']
            // 网络
            this.networks = response.data['Endpoint']['VirtualIPs']
            // 端口映射
            this.ports = response.data['Endpoint']['Ports']
            // 资源限制与预留
            this.resources = response.data['Spec']['TaskTemplate']['Resources']
            // 约束条件
            this.placementConstraints = isEmpty(response.data['Spec']['TaskTemplate']['Placement']) ? null : response.data['Spec']['TaskTemplate']['Placement']['Constraints']
            // 重启策略
            this.restartPolicy = response.data['Spec']['TaskTemplate']['RestartPolicy']
            // 更新配置
            this.updateConfig = response.data['Spec']['UpdateConfig']
            // 服务标签
            this.serviceLabels = response.data['Spec']['Labels']
            // 配置项
            this.configs = response.data['Spec']['TaskTemplate']['ContainerSpec']['Configs']
            // 加密配置项
            this.secrets = response.data['Spec']['TaskTemplate']['ContainerSpec']['Secrets']
          } else {
            this.$notification.warning({ message: '标题', description: '加载数据失败' })
          }
        })
      },
      inspectService() {
        const params = {
          serviceId: this.serviceId
        }
        invokeApi('service/inspect', params).then(response => {
          if (response.code === 2000) {
            this.visibleInspect = true
            this.serviceInspect = response.data
          } else {
            this.$notification.warning({ message: '失败', description: '获取服务摘要信息失败' })
          }
        }).catch(() => {
          this.$notification.error({ message: '异常', description: '获取服务摘要信息发生错误' })
        })
      },
      updateService() {
        const params = {
          serviceId: this.serviceId
        }
        invokeApi('service/update', params).then(response => {
          if (response.code === 2000) {
            this.loadService()
          } else {
            this.$notification.warning({ message: '失败', description: '更新服务失败' })
          }
        }).catch(() => {
          this.$notification.error({ message: '异常', description: '更新服务发生错误' })
        })
      },
      removeService() {
        const params = {
          serviceId: this.serviceId
        }
        invokeApi('service/remove', params).then(response => {
          if (response.code === 2000) {
            this.$router.push('/resources/services')
          } else {
            this.$notification.warning({ message: '失败', description: '删除服务失败' })
          }
        }).catch(() => {
          this.$notification.error({ message: '异常', description: '删除服务发生错误' })
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
