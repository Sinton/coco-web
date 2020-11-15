<template>
  <page-view>
    <a-card :title="'终端列表'" :bordered="false">
      <div slot="extra">
        <a-button-group>
          <a-button icon="table"/>
          <a-button icon="profile"/>
        </a-button-group>
      </div>
      <div class="table-operator">
        <a-button icon="reload" @click="loadEndpoints">刷新</a-button>
        <a-button type="danger" icon="delete">删除</a-button>
        <a-button type="primary" icon="plus">添加新终端</a-button>
      </div>

      <a-list :item-layout="'horizontal'" :bordered="true" :data-source="endpoints">
        <a-list-item slot="renderItem" slot-scope="record" @click="switchEndpoint">
          <a-list-item-meta>
            <a-avatar slot="avatar" size="large" shape="square" :src="'https://www.logolynx.com/images/logolynx/b7/b769fa4ba92e48da33e691a69ca62224.png'"/>
            <template slot="title">
              <span style="font-weight: bold; font-size: 1.3em; margin-right: 10px"> {{ record['name'] }}</span>
              <a-tag color="#52c41a">{{ record['status'] === 1 ? '就绪在线' : '下线' }}</a-tag>
              {{ record['updateDateTime'] | moment }}
            </template>
            <template slot="description">
              <h5>
                <a-icon type="copy" /> 应用栈 {{ JSON.parse(record['dockerConfig'])['stacks'] }}
                <a-divider type="vertical" />
                <a-icon type="copy" /> 应用服务 {{ JSON.parse(record['dockerConfig'])['services'] }}
                <a-divider type="vertical" />
                <a-icon type="copy" /> 容器 {{ JSON.parse(record['dockerConfig'])['containers']['total'] }}-
                <a-icon type="heart" theme="twoTone" two-tone-color="#52c41a"/> {{ JSON.parse(record['dockerConfig'])['containers']['running'] }}
                <a-icon type="heart" theme="twoTone" two-tone-color="#f5222d"/> {{ JSON.parse(record['dockerConfig'])['containers']['stoped'] }}
                <a-divider type="vertical" />
                <a-icon type="copy" /> 镜像 {{ JSON.parse(record['dockerConfig'])['images']['total'] }}
                <a-divider type="vertical" />
                <a-icon type="copy" /> 存储卷 {{ JSON.parse(record['dockerConfig'])['volumes'] }}
                <a-divider type="vertical" />
                <a-icon type="copy" /> 网络 {{ JSON.parse(record['dockerConfig'])['networks'] }}
              </h5>
              <a-icon type="copy" /> CPU {{ JSON.parse(record['resources'])['cpus'] }}
              <a-divider type="vertical" />
              <a-icon type="copy" /> 内存 {{ JSON.parse(record['resources'])['memory'] }}
            </template>
          </a-list-item-meta>
          <template slot="actions">
            <span>{{ record['endpointUrl'] }}</span>
            <span>{{ JSON.parse(record['dockerConfig'])['cluster'] }}</span>
            <span>{{ JSON.parse(record['dockerConfig'])['version'] }}</span>
          </template>
        </a-list-item>
      </a-list>
    </a-card>
  </page-view>
</template>

<script>
  import { PageView } from '@/layouts'
  import { STable } from '@/components'
  import { invokeApi } from '@api/http'

  export default {
    name: 'Endpoints',
    components: {
      PageView,
      STable
    },
    data() {
      return {
        endpoints: []
      }
    },
    methods: {
      switchEndpoint() {
      },
      loadEndpoints() {
        invokeApi('/endpoint/list', {}).then(response => {
          if (response.code === 2000) {
            this.endpoints = response.data
          } else {
            this.$notification.warning({ message: '标题', description: '加载数据失败' })
          }
        }).catch(() => {
          this.$notification.error({ message: '标题', description: '加载数据失败' })
        })
      }
    },
    mounted() {
      this.loadEndpoints()
    }
  }
</script>

<style scoped lang="less">
</style>
