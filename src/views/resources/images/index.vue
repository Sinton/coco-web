<template>
  <page-view>
    <a-card :bordered="false" style="margin-bottom: 20px;">
      <span slot="title">
        <a-icon type="download" style="margin-right: 5px;"/>拉取镜像
      </span>
      <a-form :form="pullImageForm">
        <a-row :gutter="48">
          <a-col :lg="12" :md="12" :sm="24">
            <a-form-item v-bind="{labelCol: { span: 3 }, wrapperCol: { span: 21 }}" label="镜像名称">
              <a-input v-decorator="[ 'imageName' ]" placeholder="请输入镜像名称 eg: hello-world:latest"/>
            </a-form-item>
          </a-col>
          <a-col :lg="12" :md="12" :sm="24">
            <a-form-item v-bind="{labelCol: { span: 4 }, wrapperCol: { span: 20 }}" label="镜像Registry">
              <a-select v-decorator="['registry', {initialValue: 'docker.io', rules: [{ required: true, message: '请选择镜像Registry'}]}]"
                        placeholder="请选择镜像Registry">
                <a-select-option value="docker.io" :selected="true">DockerHub</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <a-alert message="注意: 如果未指定镜像版本标签, 则默认版本标签为 latest" :banner="true"/>
      <div style="margin-top: 20px"
           v-for="imageLayer in imagesPullProgress"
           :key="imageLayer['id']">
        <span v-if="imageLayer['id'].length === 12 && imageLayer['progressDetail']">
          文件层：{{ imageLayer['id'] }} <a-divider type="vertical" /> {{ imageLayer['status'] }}
        </span>
        <span v-if="imageLayer['progressDetail'] && (imageLayer['status'].startsWith('Downloading') || imageLayer['status'].startsWith('Extracting'))">
          ({{ imageLayer['progressDetail']['current'] | size }} / {{ imageLayer['progressDetail']['total'] | size }})
        </span>
        <a-progress v-if="imageLayer['progressDetail'] &&
                      (imageLayer['status'].startsWith('Downloading') ||
                      imageLayer['status'].startsWith('Download complete') ||
                      imageLayer['status'].startsWith('Extracting') ||
                      imageLayer['status'].startsWith('Pull complete') ||
                      imageLayer['status'].startsWith('Already exists'))"
                    :percent="progressPercent(imageLayer, 'downloading')"
                    :success-percent="progressPercent(imageLayer, 'extracting')"
                    :status="imageLayer | percentStatus">
          <template #format="percent, successPercent" style="width: 10%">
            {{ `${!imageLayer['status'].startsWith('Extracting') ? percent: successPercent}%` }}
          </template>
        </a-progress>
      </div>
      <a-button style="margin-top: 10px"
                type="primary"
                :disabled="pulling ? true : !(pullImageForm.getFieldsValue()['imageName'] && pullImageForm.getFieldsValue()['imageName'].length > 0)"
                :loading="pulling"
                @click="pullImage">{{ pullingText }}
      </a-button>
    </a-card>
    <a-card :title="'镜像列表'" :bordered="false">
      <div class="table-operator">
        <a-button icon="reload" @click="() => $refs['imagesRef'].refresh()">刷新</a-button>
        <a-button-group>
          <a-button type="danger" icon="delete" style="margin-right: 0;" :disabled="!selectedRows.length > 0" @click="removeImage">删除</a-button>
          <a-dropdown :disabled="!selectedRows.length > 0">
            <a-menu slot="overlay">
              <a-menu-item @click="removeImage(null, true)">强制删除</a-menu-item>
            </a-menu>
            <a-button type="danger" icon="down"/>
          </a-dropdown>
        </a-button-group>
        <a-button type="primary" icon="plus">构建新镜像</a-button>
        <a-button-group>
          <a-button type="primary" icon="upload" style="margin-right: 0;">导入镜像</a-button>
          <a-button type="primary" icon="download" :disabled="!selectedRows.length > 0">导出镜像</a-button>
        </a-button-group>
      </div>

      <s-table ref="imagesRef"
               :rowKey="record => record['Id']"
               size="middle"
               :columns="columns"
               :data="loadImages"
               :alert="options.alert"
               :rowSelection="options.rowSelection">
        <!-- 镜像ID -->
        <template slot="Id" slot-scope="text, record">
          <router-link :to="{ path: `images/${record['Id'].replace('sha256:', '')}`, params: { imageId: record['Id'].replace('sha256:', '') } }">
            {{ text | truncate(40) }}
          </router-link>
        </template>
        <!-- 镜像标签 -->
        <template slot="RepoTags" slot-scope="text, record">
          <a-tag style="margin-bottom: 4px" v-for="(tagName, index) in formatRepoTags(record)" :key="index" color="#108ee9">{{ tagName }}</a-tag>
        </template>
        <!-- 镜像大小 -->
        <template slot="Size" slot-scope="text, record">
          {{ record['VirtualSize'] | size }}
        </template>
        <!-- 创建时间 -->
        <template slot="Created" slot-scope="text">
          {{ text * 1000 | moment }}
        </template>
      </s-table>
    </a-card>
  </page-view>
</template>

<script>
  import { PageView } from '@/layouts'
  import { STable } from '@/components'
  import { invokeApi } from '@api/http'

  export default {
    name: 'Images',
    components: {
      PageView,
      STable
    },
    data() {
      return {
        endpointChanged: false,
        queryParam: {},
        columns: [
          {
            title: '镜像ID',
            dataIndex: 'Id',
            sorter: true,
            scopedSlots: { customRender: 'Id' },
            width: 300
          },
          {
            title: '镜像标签',
            dataIndex: 'RepoTags',
            sorter: true,
            scopedSlots: { customRender: 'RepoTags' }
          },
          {
            title: '镜像大小',
            dataIndex: 'Size',
            sorter: true,
            scopedSlots: { customRender: 'Size' },
            width: 100
          },
          {
            title: '创建时间',
            dataIndex: 'Created',
            sorter: true,
            scopedSlots: { customRender: 'Created' },
            width: 150
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
        pullImageForm: this.$form.createForm(this),
        imagesPullProgress: [],
        pulling: false,
        pullingText: '拉取镜像'
      }
    },
    filters: {
      percentStatus(imageLayer) {
        switch (imageLayer['status']) {
          case 'Waiting':
            return 'normal'
          case 'Pulling fs layer':
            return 'normal'
          case 'Downloading':
            return 'active'
          case 'Extracting':
            return 'active'
          case 'Verifying Checksum':
            return 'normal'
          case 'Pull complete':
            return 'success'
          case 'Already exists':
            return 'success'
          default:
            return 'normal'
        }
      }
    },
    methods: {
      formatRepoTags(record) {
        let repoTags = record['RepoTags']
        if (!repoTags && record['RepoDigests']) {
          repoTags = []
          record['RepoDigests'].forEach(item => {
            const digest = item
            const repository = digest.substring(0, digest.indexOf('@'))
            repoTags.push(repository + ':<none>')
          })
        }
        if (repoTags && repoTags.length > 0) {
          if (repoTags[0] === '<none>:<none>') {
            return []
          }
          return repoTags
        }
        return []
      },
      loadImages(params) {
        params['filter'] = { all: true, dangling: false }
        return invokeApi('/image/list', { ...params, ...this.queryParam }).then(response => {
          if (response.code === 2000) {
            return response.data
          } else {
            this.$notification.error({ message: '标题', description: '加载数据失败' })
          }
        })
      },
      inspectImage(imageId) {
        const params = {
          imageId: imageId.replace('sha256:', '')
        }
        invokeApi('/image/inspect', { ...params, ...this.queryParam }).then(response => {
          if (response.code === 2000) {
            this.$notification.success({ message: '提示', description: response.data })
          } else {
            this.$notification.error({ message: '提示', description: response.data })
          }
        })
      },
      pullImage() {
        if (!_.isEmpty(this.pullImageForm.getFieldsValue()['imageName'])) {
          this.imagesPullProgress = []
          const imageName = this.pullImageForm.getFieldsValue()['imageName']
          const params = {
            imageName: imageName,
            registry: _.trim(this.pullImageForm.getFieldsValue()['registry'])
          }
          this.pulling = true
          this.pullingText = '拉取镜像中...'
          invokeApi('/image/pull', params).then(response => {
            if (response.code !== 2000) {
              this.$notification.error({ message: '提示', description: response.data })
            }
          }).catch(() => {
            this.$notification.error({ message: '错误', description: '请求接口异常' })
          })
        }
      },
      removeImage(event, force = false, noPrune = true) {
        this.selectedRows.forEach(item => {
          const params = {
            imageId: item.Id.replace('sha256:', ''),
            force: force,
            noPrune: noPrune
          }
          invokeApi('/image/remove', params).then(response => {
            if (response.code === 2000) {
              this.selectedRows = []
              this.selectedRowKeys = []
              this.$refs['imagesRef'].selectedRows = this.selectedRows
              this.$refs['imagesRef'].selectedRowKeys = this.selectedRowKeys
              this.$notification.success({ message: '提示', description: response.data })
            } else {
              this.$notification.warning({ message: '提示', description: response.data })
            }
          }).catch(() => {
            this.$notification.error({ message: '错误', description: '请求接口异常' })
          }).finally(() => {
            this.$refs['imagesRef'].refresh()
          })
        })
      },
      progressPercent(image, type) {
        const progress = Number.parseInt((image['progressDetail']['current'] / image['progressDetail']['total'] * 100).toString())
        switch (image['status']) {
          case 'Waiting':
            return 0
          case 'Downloading':
            return type === 'downloading' ? progress : 0
          case 'Download complete':
            return 100
          case 'Extracting':
            return type === 'extracting' ? progress : 100
          case 'Pull complete':
            return 100
          case 'Already exists':
            return 100
          default:
            return 0
        }
      }
    },
    sockets: {
      connect: function() {
        console.log('connect')
      },
      pull: function() {
        console.log('pull')
      }
    },
    mounted() {
      console.log('$socket', this.$socket)
      console.log('sockets', this.sockets)
      console.log('sockets', this.sockets.subscribe)
      this.sockets.subscribe('pull', (data) => {
        if (_.isEmpty(data.id)) {
          if (data['status'].startsWith('Status:') || data['status'].startsWith('Digest:')) {
            this.pulling = false
            this.pullingText = '拉取镜像'
            // 完成镜像的拉取
            if (data['status'].startsWith('Status:')) {
              this.$notification.success({
                message: '提示',
                description: `拉取镜像${this.pullImageForm.getFieldsValue()['imageName']}成功`
              })
              this.$refs['imagesRef'].refresh()
            }
          }
        } else {
          const indexOf = this.imagesPullProgress.findIndex(item => item.id === data.id)
          if (indexOf >= 0) {
            this.imagesPullProgress.splice(indexOf, 1, data)
          } else {
            this.imagesPullProgress.push(data)
          }
        }
      })
    },
    activated() {
      if (this.endpointChanged) {
        this.$refs['imagesRef'].refresh()
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
