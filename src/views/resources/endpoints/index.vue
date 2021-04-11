<template>
  <page-view>
    <a-card :title="'终端列表'" :bordered="false">
      <div class="table-operator">
        <a-button icon="reload" @click="loadEndpoints">刷新</a-button>
      </div>

      <div class="operate">
        <a-button type="dashed"
                  icon="plus"
                  style="width: 100%; margin-bottom: 10px"
                  @click="visibleEndpointData('add')">
          添加新终端
        </a-button>
      </div>

      <a-list :item-layout="'horizontal'" :bordered="true" :data-source="endpoints" :loading="loadingData">
        <a-list-item slot="renderItem" slot-scope="record">
          <a-list-item-meta>
            <a-avatar slot="avatar" size="large" shape="square" :src="'https://www.logolynx.com/images/logolynx/b7/b769fa4ba92e48da33e691a69ca62224.png'"/>
            <template slot="title">
              <span style="font-weight: bold; font-size: 1.2em; margin-right: 10px"> {{ record['name'] }}</span>
              <a-icon type="edit"
                      theme="twoTone"
                      two-tone-color="#1890ff"
                      style="margin-right: 10px"
                      @click="visibleEndpointData('modify', record)"/>
              <a-icon type="delete"
                      theme="twoTone"
                      two-tone-color="#ff4d4f"
                      style="margin-right: 10px"
                      @click="removeEndpoints(record)"/>
              <a-tag :color="record['status'] === 1 ? '#52c41a' : '#f5222d'">{{ record['status'] === 1 ? '在线' : '下线' }}</a-tag>
              {{ record['updateDateTime'] | moment }}
            </template>
            <template slot="description">
              <h5>
                <a-icon type="copy" /> 应用栈 {{ record['dockerConfig'] ? JSON.parse(record['dockerConfig'])['stacks'] : 0 }}
                <a-divider type="vertical" />
                <template v-if="record['dockerConfig'] && JSON.parse(record['dockerConfig'])['mode'] === 'cluster'">
                  <a-icon type="copy" /> 应用服务 {{ record['dockerConfig'] ? JSON.parse(record['dockerConfig'])['services'] : 0 }}
                  <a-divider type="vertical" />
                </template>
                <a-icon type="copy" /> 容器 {{ record['dockerConfig'] ? JSON.parse(record['dockerConfig'])['containers']['total'] : 0 }}-
                <a-icon type="heart" theme="twoTone" two-tone-color="#52c41a"/> {{ record['dockerConfig'] ? JSON.parse(record['dockerConfig'])['containers']['running'] : 0 }}
                <a-icon type="heart" theme="twoTone" two-tone-color="#f5222d"/> {{ record['dockerConfig'] ? JSON.parse(record['dockerConfig'])['containers']['stoped'] : 0 }}
                <a-divider type="vertical" />
                <a-icon type="copy" /> 镜像 {{ record['dockerConfig'] ? JSON.parse(record['dockerConfig'])['images']['total'] : 0 }}
                <a-divider type="vertical" />
                <a-icon type="copy" /> 存储卷 {{ record['dockerConfig'] ? JSON.parse(record['dockerConfig'])['volumes'] : 0 }}
                <a-divider type="vertical" />
                <a-icon type="copy" /> 网络 {{ record['dockerConfig'] ? JSON.parse(record['dockerConfig'])['networks'] : 0 }}
              </h5>
              <a-icon type="copy" /> {{ record['dockerConfig'] ? JSON.parse(record['resources'])['cpus'] : 0 }}
              <a-divider type="vertical" />
              <a-icon type="copy" /> {{ record['dockerConfig'] ? JSON.parse(record['resources'])['memory'] : 0 }}
            </template>
          </a-list-item-meta>
          <template slot="actions">
            <a-avatar :style="{ backgroundColor: record['id'] === selectedEndpoint ? '#52c41a' : '#f56a00'}"
                      @click="switchEndpoint(record)">
              {{ record['id'] === selectedEndpoint ? '使用' : '未用' }}
            </a-avatar>
          </template>
          <div slot="extra">
            <span style="color: #00000073;">{{ record['endpointUrl'] }}</span>
            <a-divider type="vertical" />
            <span style="color: #00000073;">{{ record['dockerConfig'] && JSON.parse(record['dockerConfig'])['mode'] | mode }}</span>
            <a-divider type="vertical" />
            <span style="color: #00000073;">{{ record['dockerConfig'] ? JSON.parse(record['dockerConfig'])['version'] : '未知' }}</span>
          </div>
        </a-list-item>
      </a-list>
    </a-card>
    <endpoint-form :visible="visible"
                   :operate-type="operateType"
                   :data="endpointData"
                   @on-close="() => this.visible = false"
                   @submitted="submitted"/>
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
    filters: {
      mode(type) {
        return type === 'standalone' ? '单点' : 'Swarm集群'
      }
    },
    data() {
      return {
        visible: false,
        operateType: 'add',
        endpoints: [],
        endpointData: {},
        loadingData: false
      }
    },
    computed: {
      ...mapState({
        selectedEndpoint: state => state.app.endpoint
      })
    },
    methods: {
      visibleEndpointData(operateType, endpoint) {
        this.visible = true
        this.operateType = operateType
        switch (operateType) {
          case 'add':
            this.endpointData = null
            break
          case 'modify':
            this.endpointData = endpoint
            break
          default:
            break
        }
      },
      removeEndpoints(endpoints) {
        invokeApi('/endpoint/remove', endpoints).then(response => {
          if (response.code === 2000) {
            this.$notification.success({ message: '成功', description: response.data })
          } else {
            this.$notification.warning({ message: '失败', description: response.data })
          }
        }).catch((error) => {
          this.$notification.error({ message: '错误', description: error })
        }).finally(() => {
          this.loadEndpoints()
        })
      },
      switchEndpoint(endpoint) {
        if (endpoint['status'] === 1) {
          const params = {
            id: endpoint['id']
          }
          invokeApi('/endpoint/switch', params).then(response => {
            this.$store.commit('SWITCH_ENDPOINT', endpoint['id'])
          }).catch(() => {
            this.$notification.error({ message: '标题', description: '切换服务终端失败' })
          })
        } else {
          this.$notification.warning({ message: '警告', description: '未上线的服务终端无法进行切换' })
        }
      },
      loadEndpoints() {
        this.loadingData = true
        return invokeApi('/endpoint/list', {}).then(response => {
          if (response.code === 2000) {
            this.endpoints = response.data.data.map(item => {
              if (item['dockerConfig'] === '0') {
                item['dockerConfig'] = null
              }
              return item
            })
            this.loadingData = false
            return response.data
          } else {
            this.$notification.warning({ message: '标题', description: '加载数据失败' })
          }
        }).catch(() => {
          this.$notification.error({ message: '标题', description: '加载数据失败' })
        })
      },
      submitted() {
        this.loadEndpoints()
      }
    },
    mounted() {
      this.loadEndpoints()
    }
  }
</script>

<style scoped lang="less">
</style>
