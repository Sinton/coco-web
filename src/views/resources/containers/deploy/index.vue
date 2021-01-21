<template>
  <page-view>
    <a-card title="容器配置" :bordered="false" style="margin-top: 24px">
      <a-form :form="containerSpecForm">
        <a-form-item v-bind="formItemLayout" label="容器名称">
          <a-input v-decorator="['name', {rules: [{ required: true, message: '请输入容器名称', whitespace: true}]}]"
                   :allow-clear="true"
                   placeholder="请输入容器名称"/>
        </a-form-item>
        <a-form-item v-bind="formItemLayout" label="容器镜像">
          <a-auto-complete v-decorator="['image', {rules: [{ required: true, message: '请输入镜像', whitespace: true}]}]"
                           :data-source="isEmpty(this.containerSpecForm.getFieldValue('image')) ? [] : availableImages"
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
        <a-form-item v-bind="formItemLayout" label="总是拉取镜像">
          <a-switch checkedChildren="开" unCheckedChildren="关" style="margin-right: 5px"/>
          <a-tooltip placement="right">
            <a-icon type="question-circle"/>
            <template slot="title">启用后，系统将在创建容器之前自动尝试拉取指定的Docker镜像</template>
          </a-tooltip>
        </a-form-item>
        <a-form-item v-bind="formItemLayout" label="自动删除">
          <a-switch v-decorator="['autoRemove', {initialValue: false}]" checkedChildren="开" unCheckedChildren="关" style="margin-right: 5px"/>
          <a-tooltip placement="right">
            <a-icon type="question-circle"/>
            <template slot="title">启用后，系统会在容器退出或者结束时自动删除该容器。当您只想一次性使用容器时，可以选择开启</template>
          </a-tooltip>
        </a-form-item>
        <a-form-item v-bind="formItemLayout" label="映射所有暴露端口">
          <a-switch v-decorator="['publishAllPorts', {initialValue: false}]" checkedChildren="开" unCheckedChildren="关" style="margin-right: 5px"/>
          <a-tooltip placement="right">
            <a-icon type="question-circle"/>
            <template slot="title">启用后，系统将会镜像Dockerfile中定义的每个端口会映射到宿主机的随机端口上</template>
          </a-tooltip>
        </a-form-item>
      </a-form>
      <!-- 容器基础配置 -->
      <coco-topic>基础配置</coco-topic>
      <a-divider/>
      <a-tabs default-activeKey="ports">
        <a-tab-pane tab="映射端口" key="ports">
          <container-ports :data="portData"/>
        </a-tab-pane>
        <a-tab-pane tab="环境变量" key="envs">
          <container-envs :data="envData"/>
        </a-tab-pane>
        <a-tab-pane tab="标签" key="labels">
          <container-labels :data="labelData"/>
        </a-tab-pane>
      </a-tabs>
      <!-- 容器高级配置 -->
      <coco-topic style="margin-top: 20px">高级配置</coco-topic>
      <a-divider/>
      <a-tabs default-activeKey="command">
        <a-tab-pane tab="命令" key="command">
          <container-command :form-item-layout="formItemLayout" :data="commandData"/>
        </a-tab-pane>
        <a-tab-pane tab="存储卷" key="volumes">
          <container-volumes :data="volumeData"/>
        </a-tab-pane>
        <a-tab-pane tab="网络" key="networks">
          <container-networks :form-item-layout="formItemLayout" :data="networkData"/>
        </a-tab-pane>
        <a-tab-pane tab="运行环境" key="runtime">
          <container-runtime :data="runtimeData"/>
        </a-tab-pane>
        <a-tab-pane tab="资源配额" key="resources">
          <container-resources :data="resourceData"/>
        </a-tab-pane>
        <a-tab-pane tab="功能集" key="capability" style="height: 400px; overflow: paged-y">
        </a-tab-pane>
      </a-tabs>
    </a-card>
    <div class="fixed-block">
      <a-button type="primary" :disabled="deployable()" :loading="deploying" @click="deployContainer">
        {{ deployingText }}
      </a-button>
    </div>
  </page-view>
</template>

<script>
  import { PageView } from '@/layouts'
  import DetailList from '@/components/tools/DetailList'
  import { CocoTopic } from '@/components/Coco'
  import { invokeApi } from '@/api/http'
  import ContainerPorts from '@views/resources/containers/deploy/ports'
  import ContainerEnvs from '@views/resources/containers/deploy/envs'
  import ContainerLabels from '@views/resources/containers/deploy/labels'
  import ContainerCommand from '@views/resources/containers/deploy/command'
  import ContainerVolumes from '@views/resources/containers/deploy/volumes'
  import ContainerResources from '@views/resources/containers/deploy/resources'
  import ContainerNetworks from '@views/resources/containers/deploy/networks'
  import ContainerRuntime from '@views/resources/containers/deploy/runtime'

  export default {
    name: 'ContainerDeploy',
    components: {
      ContainerPorts,
      ContainerEnvs,
      ContainerLabels,
      ContainerCommand,
      ContainerVolumes,
      ContainerResources,
      ContainerNetworks,
      ContainerRuntime,
      PageView,
      DetailList,
      DetailListItem: DetailList.Item,
      CocoTopic
    },
    data() {
      return {
        formItemLayout: {
          labelCol: { span: 2 },
          wrapperCol: { span: 22 }
        },
        containerSpecForm: this.$form.createForm(this),
        portData: [],
        envData: [],
        labelData: [],
        commandData: {
          command: '',
          entryPoint: '',
          workingDir: '',
          user: '',
          console: 'null'
        },
        volumeData: [],
        networkData: {
          network: undefined,
          hostname: '',
          domainName: '',
          macAddr: '',
          ipv4: '',
          ipv6: ''
        },
        runtimeData: {
          restartPolicy: 'never',
          privilegedMode: false
        },
        resourceData: {
          memoryReservations: 0,
          memoryLimits: 0,
          cpuLimits: 0
        },
        availableImages: [],
        deploying: false,
        deployingText: '部署'
      }
    },
    methods: {
      deployable() {
        return _.isEmpty(this.containerSpecForm.getFieldValue('name')) || _.isEmpty(this.containerSpecForm.getFieldValue('image'))
      },
      deployContainer() {
        let params = {
          name: this.containerSpecForm.getFieldValue('name'),
          image: this.containerSpecForm.getFieldValue('image'),
          autoRemove: this.containerSpecForm.getFieldValue('autoRemove'),
          publishAllPorts: this.containerSpecForm.getFieldValue('publishAllPorts')
        }

        params['ports'] = {}
        this.portData.forEach(item => {
          if (!_.isEmpty(item['containerPort']) || _.isNumber(item['containerPort'])) {
            params['ports'][`${item['containerPort']}/${item['protocol']}`] = item['hostPort']
          }
        })

        params['envs'] = {}
        this.envData.forEach(item => {
          if (!_.isEmpty(item['name'])) {
            params['envs'][item['name']] = item['value']
          }
        })

        params['labels'] = {}
        this.labelData.forEach(item => {
          if (!_.isEmpty(item['name'])) {
            params['labels'][item['name']] = item['value']
          }
        })

        params['volumes'] = {}
        this.volumeData.forEach(item => {
          if (!_.isEmpty(item['source'])) {
            params['volumes'][item['source']] = item['containerPath']
          }
        })

        params['networkingConfig'] = this.networkData

        params['resources'] = this.resourceData

        params = { ...params, ...this.runtimeData }

        this.deploying = true
        this.deployingText = '部署中'
        invokeApi('/container/create', params).then(response => {
          if (response.code === 2000) {
            this.$notification.success({ message: '提示', description: response.data })
            this.$router.push('/resources/containers')
          } else {
            this.$notification.warning({ message: '警告', description: response.data })
          }
        }).catch(() => {
          this.$notification.error({ message: '错误', description: '部署容器失败' })
        }).finally(() => {
          this.deploying = false
          this.deployingText = '部署'
        })
      },
      loadImages() {
        const params = {
          filter: { all: true, dangling: false },
          searchName: this.containerSpecForm.getFieldValue('image')
        }
        if (!_.isEmpty(this.containerSpecForm.getFieldValue('image'))) {
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
    },
    mounted() {
      this.loadImages()
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
