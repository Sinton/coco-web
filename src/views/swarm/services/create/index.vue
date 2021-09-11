<template>
  <page-view>
    <a-card title="服务配置" :bordered="false" style="margin-top: 24px">
      <a-form :form="serviceSpecForm">
        <a-form-item v-bind="formItemLayout" label="服务名称">
          <a-input v-decorator="['name', {rules: [{ required: true, message: '请输入容器名称', whitespace: true}]}]"
                   :allow-clear="true"
                   placeholder="请输入服务名称"/>
        </a-form-item>
        <a-form-item v-bind="formItemLayout" label="镜像">
          <a-auto-complete v-decorator="['image', {rules: [{ required: true, message: '请输入镜像', whitespace: true}]}]"
                           :data-source="isEmpty(this.serviceSpecForm.getFieldValue('image')) ? [] : availableImages"
                           :allow-clear="true"
                           :filter-option="filterImages"
                           @search="loadImages"
                           placeholder="请输入镜像">
          </a-auto-complete>
        </a-form-item>
        <a-form-item v-bind="formItemLayout" label="镜像仓库">
          <a-select v-decorator="['registry', {initialValue: 'docker.io'}]" placeholder="请选择镜像Registry">
            <a-select-option value="docker.io">DockerHub</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item v-bind="formItemLayout" label="调度模式">
          <a-radio-group v-decorator="['schedulingMode',{initialValue: '1', rules: [{ required: true, message: '请选择服务调度模式' }]}]">
            <a-radio value="1">全局</a-radio>
            <a-radio value="2">集群副本</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item v-if="serviceSpecForm.getFieldValue('schedulingMode') === '2'" v-bind="formItemLayout" label="副本数">
          <a-input-number v-decorator="['replicas',{initialValue: 1}]"/>
        </a-form-item>
      </a-form>
      <!-- 服务基础配置 -->
      <coco-topic>基础配置</coco-topic>
      <a-divider/>
      <a-tabs default-activeKey="port">
        <a-tab-pane tab="映射端口" key="ports">
          <coco-editor-table :columns="portColumns"
                             :data="portData"
                             :button-text="'添加端口映射'">
            <template slot="body" slot-scope="item">
              <template v-if="item.record['editable']">
                <a-input-number v-if="item.column['dataIndex'] !== 'protocol'"
                                v-model="item.record['editor'][item.column['dataIndex']]"
                                :min="1"
                                :step="1"
                                style="margin: -6px 0; width: 100%;"/>
                <a-select v-else-if="item.column['dataIndex'] === 'protocol'"
                          v-model="item.record['editor'][item.column['dataIndex']]"
                          style="width: 100px;">
                  <a-select-option value="tcp">tcp</a-select-option>
                  <a-select-option value="udp">udp</a-select-option>
                </a-select>
              </template>
              <template v-else>{{ item.text }}</template>
            </template>
          </coco-editor-table>
        </a-tab-pane>
        <a-tab-pane tab="环境变量" key="envs">
          <coco-editor-table :columns="envsColumns" :data="envsData" :button-text="'添加环境变量'"/>
        </a-tab-pane>
        <a-tab-pane tab="服务标签" key="serviceLabels">
          <coco-editor-table :columns="labelColumns" :data="serviceLabelData" :button-text="'添加服务标签'"/>
        </a-tab-pane>
        <a-tab-pane tab="容器标签" key="containerLabels">
          <coco-editor-table :columns="labelColumns" :data="containerLabelData" :button-text="'添加容器标签'"/>
        </a-tab-pane>
      </a-tabs>
      <!-- 服务高级配置 -->
      <coco-topic style="margin-top: 20px">高级配置</coco-topic>
      <a-divider/>
      <a-tabs default-activeKey="command">
        <a-tab-pane tab="命令" key="command">
          <create-service-command :form-item-layout="formItemLayout" :data="commandData"/>
        </a-tab-pane>
        <a-tab-pane tab="网络" key="network">
          <create-service-networks/>
        </a-tab-pane>
        <a-tab-pane tab="存储卷" key="volumes">
          <service-volumes/>
        </a-tab-pane>
        <a-tab-pane tab="运行环境" key="runtime">
          <a-collapse :activeKey="['restartPolicy', 'updateConfig']" :bordered="false">
            <template #expandIcon="props">
              <a-icon type="caret-right" :rotate="props.isActive ? 90 : 0" />
            </template>
            <a-collapse-panel key="restartPolicy" header="重启策略">
              <common-service-restart-policy/>
            </a-collapse-panel>
            <a-collapse-panel key="updateConfig" header="更新配置">
              <common-service-update-config/>
            </a-collapse-panel>
          </a-collapse>
        </a-tab-pane>
        <a-tab-pane tab="配置项" key="config">
          <create-service-configs/>
        </a-tab-pane>
        <a-tab-pane tab="加密配置项" key="secret">
          <create-service-secrets/>
        </a-tab-pane>
        <a-tab-pane tab="资源配额" key="resource">
          <common-service-resources/>
        </a-tab-pane>
        <a-tab-pane tab="约束" key="placementConstraints">
          <common-service-placement-constraints/>
        </a-tab-pane>
      </a-tabs>
    </a-card>
    <div class="fixed-block">
      <a-button type="primary" :disabled="creatable()" :loading="deploying" @click="createService">
        {{ deployingText }}
      </a-button>
    </div>
  </page-view>
</template>

<script>
  import { PageView } from '@/layouts'
  import { CocoTopic, CocoEditorTable } from '@/components/Coco'
  import ServiceVolumes from '@/views/swarm/services/create/volumes'
  import CommonServiceResources from '@/views/swarm/services/common/resources'
  import CommonServiceRestartPolicy from '@/views/swarm/services/common/restartPolicy'
  import CommonServiceUpdateConfig from '@/views/swarm/services/common/updateConfig'
  import CreateServiceCommand from '@/views/swarm/services/create/command'
  import CreateServiceNetworks from '@/views/swarm/services/create/networks'
  import CreateServiceConfigs from '@/views/swarm/services/create/configs'
  import CreateServiceSecrets from '@/views/swarm/services/create/secrets'
  import CommonServicePlacementConstraints from '@/views/swarm/services/common/placementConstraints'
  import { invokeApi } from '@api/http'

  export default {
    name: 'ServiceCreate',
    components: {
      PageView,
      CocoEditorTable,
      CocoTopic,
      ServiceVolumes,
      CommonServiceResources,
      CommonServiceRestartPolicy,
      CommonServiceUpdateConfig,
      CreateServiceCommand,
      CreateServiceNetworks,
      CreateServiceConfigs,
      CreateServiceSecrets,
      CommonServicePlacementConstraints
    },
    data() {
      return {
        formItemLayout: { labelCol: { span: 2 }, wrapperCol: { span: 22 } },
        serviceSpecForm: this.$form.createForm(this),
        portColumns: [
          {
            title: '宿主机映射端口',
            dataIndex: 'hostPort',
            scopedSlots: { customRender: 'hostPort' }
          },
          {
            title: '容器端口',
            dataIndex: 'containerPort',
            scopedSlots: { customRender: 'containerPort' }
          },
          {
            title: '协议',
            dataIndex: 'protocol',
            scopedSlots: { customRender: 'protocol' },
            width: 120
          },
          {
            title: '操作',
            dataIndex: 'action',
            scopedSlots: { customRender: 'action' },
            width: 120
          }
        ],
        portData: [],
        labelColumns: [
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
        serviceLabelData: [],
        containerLabelData: [],
        envsColumns: [
          {
            title: '变量名',
            dataIndex: 'name',
            scopedSlots: { customRender: 'name' }
          },
          {
            title: '变量值',
            dataIndex: 'value',
            scopedSlots: { customRender: 'value' }
          },
          {
            title: '操作',
            dataIndex: 'action',
            scopedSlots: { customRender: 'action' },
            width: 120
          }
        ],
        envsData: [],
        configColumns: [
          {
            title: '配置项名称',
            dataIndex: 'name',
            scopedSlots: { customRender: 'name' }
          },
          {
            title: '配置项挂载点',
            dataIndex: 'containerPath',
            scopedSlots: { customRender: 'containerPath' }
          },
          {
            title: '操作',
            dataIndex: 'action',
            scopedSlots: { customRender: 'action' },
            width: 120
          }
        ],
        configData: [],
        secretColumns: [
          {
            title: '配置项名称',
            dataIndex: 'name',
            scopedSlots: { customRender: 'name' }
          },
          {
            title: '挂载点类型',
            dataIndex: 'type',
            scopedSlots: { customRender: 'type' },
            width: 120
          },
          {
            title: '操作',
            dataIndex: 'action',
            scopedSlots: { customRender: 'action' },
            width: 120
          }
        ],
        secretData: [],
        availableImages: [],
        commandData: {
          command: '',
          entryPoint: '',
          workingDir: '',
          user: ''
        },
        deploying: false,
        deployingText: '部署'
      }
    },
    methods: {
      creatable() {
        return _.isEmpty(this.serviceSpecForm.getFieldValue('name')) ||
          _.isEmpty(this.serviceSpecForm.getFieldValue('image')) ||
          _.isEmpty(this.serviceSpecForm.getFieldValue('schedulingMode'))
      },
      createService() {
        this.deploying = true
        this.deployingText = '部署中...'
        const params = this.serviceSpecForm.getFieldsValue()
        params['ports'] = this.portData.map(item => {
          return {
            publishedPort: item['hostPort'],
            targetPort: item['containerPort'],
            protocol: item['protocol']
          }
        })
        params['serviceLabels'] = _.isEmpty(this.serviceLabelData) ? {} : this.serviceLabelData.map(item => {
          const label = {}
          label[item.name] = item.value
          return label
        })
        params['containerLabels'] = _.isEmpty(this.containerLabelData) ? {} : this.containerLabelData.map(item => {
          const label = {}
          label[item.name] = item.value
          return label
        })
        invokeApi('/service/create', params).then(response => {
          if (response.code === 2000) {
          } else {
            this.$notification.warning({ message: '警告', description: response.data })
          }
        }).catch(error => {
          this.$notification.error({ message: '错误', description: error || '接口请求异常' })
        }).finally(() => {
          this.deploying = false
          this.deployingText = '部署'
        })
      },
      loadImages() {
        const params = {
          filter: { all: true, dangling: false },
          searchName: this.serviceSpecForm.getFieldValue('image')
        }
        if (!_.isEmpty(this.serviceSpecForm.getFieldValue('image'))) {
          invokeApi('/image/list', params).then(response => {
            if (response.code === 2000) {
              this.availableImages = []
              response.data.data.forEach(image => {
                this.availableImages = _.union(this.availableImages, image['RepoTags'])
              })
            } else {
              this.availableImages = []
              this.$notification.warning({ message: '警告', description: response.data })
            }
          }).catch(error => {
            this.$notification.error({ message: '错误', description: error })
          })
        }
      },
      filterImages(input, option) {
        return option.componentOptions.children[0].text.includes(input)
      },
      isEmpty(text) {
        return _.isEmpty(text)
      }
    }
  }
</script>

<style scoped lang="less">
.fixed-block {
  z-index: 1;
  position: absolute;
  bottom: 0;
  width: 100%;
  border-top: 1px solid #e8e8e8;
  padding: 10px 16px;
  text-align: right;
  left: 0;
  background: #fff;
  border-radius: 0 0 4px 4px;

  .ant-btn {
    margin-right: 8px
  }
}
</style>
