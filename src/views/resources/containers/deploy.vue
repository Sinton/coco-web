<template>
  <page-view>
    <a-card title="容器配置" :bordered="false" style="margin-top: 24px">
      <!-- 容器基础配置 -->
      <coco-topic>基础配置</coco-topic>
      <a-divider/>
      <a-form :form="baseFrom">
        <a-form-item v-bind="{labelCol: { span: 1 }, wrapperCol: { span: 23 }}" label="容器名称">
          <a-input v-decorator="['name', {rules: [{ required: true, message: '请输入容器名称', whitespace: true}]}]"
                   placeholder="请输入容器名称"/>
        </a-form-item>
        <a-form-item v-bind="{labelCol: { span: 1 }, wrapperCol: { span: 23 }}" label="镜像">
          <a-input v-decorator="['image', {rules: [{ required: true, message: '请输入镜像', whitespace: true}]}]"
                   placeholder="请输入镜像"/>
        </a-form-item>
        <a-form-item v-bind="{labelCol: { span: 1 }, wrapperCol: { span: 23 }}" label="镜像Registry">
          <a-select v-decorator="['registry', {initialValue: 'DockerHub', rules: [{ required: true, message: '请选择镜像Registry'}]}]"
                    placeholder="请选择镜像Registry">
            <a-select-option value="DockerHub">DockerHub</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item v-bind="{labelCol: { span: 1 }, wrapperCol: { span: 23 }}" label="映射端口">
          <coco-edit-table :table-columns="portColumns"
                           :table-data="portData"
                           :add-text="'新增映射端口'"
                           :editor-select-item-default="{protocol: 'tcp'}"
                           :editor-select-item="{protocol: [{text: 'tcp', value: 'tcp'}, {text: 'udp', value: 'udp'}]}"
                           @edit-input-change="(value, key, column) => {this.editTableInputChange(value, key, column, this.portData)}"
                           @on-add-item="portAddItem"
                           @remove-editor-item="key => {this.portData = this.portData.filter(item => item.key !== key)}"
                           ref="portMapsRef">
          </coco-edit-table>
        </a-form-item>
      </a-form>
      <!-- 容器高级配置 -->
      <coco-topic style="margin-top: 20px">高级配置</coco-topic>
      <a-divider/>
      <a-tabs defaultActiveKey="commond">
        <a-tab-pane key="commond" style="height: 400px; overflow: paged-y">
          <template slot="tab">命令</template>
          <a-form :form="commandForm">
            <a-form-item v-bind="formItemLayout" label="命令">
              <a-input/>
            </a-form-item>
            <a-form-item v-bind="formItemLayout" label="启动命令脚本">
              <a-input/>
            </a-form-item>
            <a-form-item v-bind="formItemLayout" label="工作目录">
              <a-input/>
            </a-form-item>
            <a-form-item v-bind="formItemLayout" label="用户">
              <a-input/>
            </a-form-item>
            <a-form-item v-bind="formItemLayout" label="控制台交互方式">
              <a-radio-group>
                <a-radio value="it">Interactive & TTY</a-radio>
                <a-radio value="i">Interactive</a-radio>
                <a-radio value="t">TTY</a-radio>
                <a-radio value="null">默认</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-form>
        </a-tab-pane>
        <a-tab-pane tab="存储卷" key="volumn" style="height: 400px; overflow: paged-y">
          <coco-edit-table :table-columns="volumeColumns"
                           :table-data="volumeData"
                           :add-text="'新增卷挂载'"
                           :editor-select-item-default="{volumnType: 'bind', volumnName: availableVolumes.length > 0 ? availableVolumes[0].value : ''}"
                           :editor-select-item="{volumnType: [{text: '路径', value: 'bind'}, {text: '卷', value: 'volumn'}], volumnName: availableVolumes}"
                           @on-add-item="volumeAddItem"
                           @on-remove-item="volumeRemoveItem"
                           ref="volumnMapsRef">
          </coco-edit-table>
        </a-tab-pane>
        <a-tab-pane tab="网络" key="network" style="height: 400px; overflow: paged-y">
          <a-form :form="networkForm">
            <a-form-item v-bind="formItemLayout" label="网络">
              <a-select v-model="networkForm.network" placeholder="请选择网络">
                <a-select-option
                  v-for="network in availableNetworks"
                  :key="network.id"
                  :value="network.id">
                  {{ network.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item v-bind="formItemLayout" label="IPv4地址">
              <a-input/>
            </a-form-item>
            <a-form-item v-bind="formItemLayout" label="IPv6地址">
              <a-input/>
            </a-form-item>
            <a-form-item v-bind="formItemLayout" label="MAC地址">
              <a-input/>
            </a-form-item>
            <a-form-item v-bind="formItemLayout" label="主机名">
              <a-input/>
            </a-form-item>
            <a-form-item v-bind="formItemLayout" label="域名">
              <a-input/>
            </a-form-item>
          </a-form>
        </a-tab-pane>
        <a-tab-pane tab="环境变量" key="env" style="height: 400px; overflow: paged-y">
          <coco-edit-table :table-columns="envColumns"
                           :table-data="envData"
                           :add-text="'新增环境变量'"
                           @edit-input-change="envEditTableInputChange"
                           @on-remove-item="envRemoveItem"
                           ref="envMapsRef">
          </coco-edit-table>
        </a-tab-pane>
        <a-tab-pane tab="运行环境" key="runtime" style="height: 400px; overflow: paged-y">
          <a-form :form="restartForm">
            <a-form-item v-bind="formItemLayout" label="重启策略">
              <a-radio-group>
                <a-radio value="never">不重启</a-radio>
                <a-radio value="alway">总是重启</a-radio>
                <a-radio value="failure">运行失败时</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-form>
        </a-tab-pane>
        <a-tab-pane tab="资源配额" key="resource" style="height: 400px; overflow: paged-y">
          <a-form :form="resourceForm">
            <a-form-item v-bind="formItemLayout" label="内存最低使用配额">
              <a-slider style="float: left; width: 80%" :marks="{ 0: '无限制', 100: '100%' }" :setp="10"/>
              <a-input style="float: right; width: 15%"/>
            </a-form-item>
            <a-form-item v-bind="formItemLayout" label="内存最高使用配额">
              <a-slider style="float: left; width: 80%" :marks="{ 0: '无限制', 100: '100%' }" :setp="10"/>
              <a-input style="float: right; width: 15%"/>
            </a-form-item>
            <a-form-item v-bind="formItemLayout" label="CPU使用率配额">
              <a-slider style="width: 95%" :marks="{ 0: '无限制', 100: '100%' }" :setp="25"/>
            </a-form-item>
          </a-form>
        </a-tab-pane>
        <a-tab-pane tab="标签" key="label" style="height: 400px; overflow: paged-y">
          <coco-edit-table :table-columns="labelColumns"
                           :table-data="labelData"
                           :add-text="'新增容器标签'"
                           @edit-input-change="(value, key, column) => {this.editTableInputChange(value, key, column, this.labelData)}"
                           @remove-editor-item="key => {this.labelData = this.labelData.filter(item => item.key !== key)}"
                           ref="labelMapsRef">
          </coco-edit-table>
        </a-tab-pane>
        <a-tab-pane tab="功能集" key="capability" style="height: 400px; overflow: paged-y"></a-tab-pane>
      </a-tabs>
    </a-card>
    <div class="fixed-block">
      <a-button>取消</a-button>
      <a-button type="primary" @click="deployContainer">部署</a-button>
    </div>
  </page-view>
</template>

<script>
  import { PageView } from '@/layouts'
  import DetailList from '@/components/tools/DetailList'
  import { CocoTopic, CocoEditTable } from '@/components/Coco'
  import { invokeApi } from '@/api/http'

  export default {
    name: 'ContainerDeploy',
    components: {
      PageView,
      DetailList,
      DetailListItem: DetailList.Item,
      CocoTopic,
      CocoEditTable
    },
    data() {
      return {
        formItemLayout: {
          labelCol: { span: 2 },
          wrapperCol: { span: 22 }
        },
        baseFrom: this.$form.createForm(this),
        commandForm: {
          command: '',
          entryPoint: '',
          workingDir: '',
          user: '',
          console: 'null'
        },
        networkForm: {
          network: '',
          hostname: '',
          domainName: '',
          macAddr: '',
          ipv4: '',
          ipv6: ''
        },
        restartForm: {
          restart: ''
        },
        resourceForm: {
          memoryReservation: '',
          memoryLimit: '',
          cpuLimit: ''
        },
        portColumns: [
          {
            title: '容器端口',
            dataIndex: 'containerPort',
            key: 'containerPort',
            editType: 'input',
            scopedSlots: { customRender: 'containerPort' }
          },
          {
            title: '映射主机端口',
            dataIndex: 'hostPort',
            key: 'hostPort',
            editType: 'input',
            scopedSlots: { customRender: 'hostPort' }
          },
          {
            title: '协议',
            dataIndex: 'protocol',
            key: 'protocol',
            editType: 'select',
            scopedSlots: { customRender: 'protocol' },
            width: 150
          },
          {
            title: '操作',
            key: 'action',
            scopedSlots: { customRender: 'operation' },
            width: 80
          }
        ],
        portData: [],
        envColumns: [
          {
            title: '环境变量名',
            dataIndex: 'envName',
            key: 'envName',
            editType: 'input',
            scopedSlots: { customRender: 'envName' }
          },
          {
            title: '环境变量值',
            dataIndex: 'envValue',
            key: 'envValue',
            editType: 'input',
            scopedSlots: { customRender: 'envValue' }
          },
          {
            title: '操作',
            key: 'action',
            scopedSlots: { customRender: 'operation' },
            width: 80
          }
        ],
        envData: [],
        volumeColumns: [
          {
            title: '挂载卷类型',
            dataIndex: 'volumnType',
            key: 'volumnType',
            editType: 'select',
            scopedSlots: { customRender: 'volumnType' },
            width: 150
          },
          {
            title: '挂载卷名称',
            dataIndex: 'volumnName',
            key: 'volumnName',
            editType: 'select',
            scopedSlots: { customRender: 'volumnName' },
            width: 250
          },
          {
            title: '容器挂载点',
            dataIndex: 'containerPath',
            key: 'containerPath',
            editType: 'input',
            scopedSlots: { customRender: 'containerPath' }
          },
          {
            title: '映射主机挂载点',
            dataIndex: 'hostPath',
            key: 'hostPath',
            editType: 'input',
            scopedSlots: { customRender: 'hostPath' }
          },
          {
            title: '操作',
            key: 'action',
            scopedSlots: { customRender: 'operation' },
            width: 80
          }
        ],
        volumeData: [],
        labelColumns: [
          {
            title: '标签名',
            dataIndex: 'labelName',
            key: 'labelName',
            editType: 'input',
            scopedSlots: { customRender: 'labelName' }
          },
          {
            title: '标签值',
            dataIndex: 'labelValue',
            key: 'labelValue',
            editType: 'input',
            scopedSlots: { customRender: 'labelValue' }
          },
          {
            title: '操作',
            key: 'action',
            scopedSlots: { customRender: 'operation' },
            width: 80
          }
        ],
        labelData: [],
        availableNetworks: [],
        availableVolumes: []
      }
    },
    methods: {
      envEditTableInputChange(value, key, column) {
        this.editTableInputChange(value, key, column, this.envData)
      },
      envRemoveItem(key) {
        this.envData = this.envData.filter(item => item.key !== key)
      },
      portAddItem() {
        this.editTableItemAdd(this.portColumns, this.portData)
      },
      volumeAddItem() {
        this.editTableItemAdd(this.volumeColumns, this.volumeData)
      },
      volumeRemoveItem(key) {
        this.volumeData = this.volumeData.filter(item => item.key !== key)
      },
      editTableItemAdd(tableColumns, tableData) {
        const length = tableData.length
        const rowMap = {
          key: length === 0 ? '1' : (parseInt(tableData[length - 1].key) + 1).toString(),
          editable: true,
          isNew: true
        }
        // 设置列默认值
        tableColumns.forEach(columnItem => {
          rowMap[columnItem.dataIndex] = ''
        })
        tableData.push(rowMap)
        console.log(tableData)
      },
      editTableInputChange(value, key, column, tableData) {
        const newData = [...tableData]
        const currRow = newData.filter(item => key === item.key)[0]
        if (currRow) {
          currRow[column] = value
          tableData = newData
        }
      },
      deployContainer() {
        const params = {
          image: 'zookeeper',
          name: 'deploy_test',
          // container <--> host
          portMapping: {
            '2181/tcp': 2181
          }
        }
        invokeApi('/container/create', params).then(response => {
          if (response.code === 2000) {
            this.$notification.success({ message: '提示', description: response.data })
            this.$router.push('/resources/containers')
          } else {
            this.$notification.warning({ message: '警告', description: response.data })
          }
        })
      },
      loadImages() {
        invokeApi('/image/list', {}).then(response => {
          if (response.code === 2000) {
            console.log(response.data)
          } else {
            this.$notification.warning({ message: '警告', description: response.data })
          }
        }).catch(error => {
          this.$notification.error({ message: '错误', description: error })
        })
      }
    },
    created() {
      this.availableNetworks = [
        { id: 'ingress', name: 'ingress' },
        { id: 'bright', name: 'bright' },
        { id: 'docker', name: 'docker' }
      ]
      this.availableVolumes = [
        { text: 'dd23a2dd', value: 'dd23a2dd' },
        { text: 'dd23asd2dd', value: 'dd23asd2dd' },
        { text: 'dd2aj32dd', value: 'dd2aj32dd' }
      ]
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
