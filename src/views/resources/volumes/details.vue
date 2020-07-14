<template>
  <page-view logo="https://gw.alipayobjects.com/zos/rmsportal/nxkuOJlFJuAUhzlMTCEe.png">
    <detail-list slot="headerContent" size="small" :col="2" class="detail-layout">
      <detail-list-item v-for="desc in detailsOption.desc"
                        :key="desc.prop"
                        :term="desc.label">
        <!-- 卷标签 -->
        <template v-if="desc.prop === 'labels' && desc.value !== null">
          <coco-shield v-for="label in Object.keys(desc.value)"
                       :key="label"
                       :label="label">
            {{ desc.value[label] }}
          </coco-shield>
        </template>
        <template v-else>{{ desc.value | whether }}</template>
      </detail-list-item>
    </detail-list>
    <template slot="headerContent">
      <a-button icon="delete" type="link" @click="removeVolume()">移除</a-button>
    </template>

    <a-card :title="'正在使用卷的容器'" :bordered="false" style="margin-bottom: 20px;" class="compact">
      <a-table :columns="containersOption.columns"
               :dataSource="containersOption.data"
               :pagination="false">
        <!-- 容器名称 -->
        <template slot="Name" slot-scope="text, record">
          <router-link :to="{ path: `/resources/containers/${record['Id']}`, params: { containerId: record['Id'] } }">
            {{ record['Names'][0].substring(1) }}
          </router-link>
          <a-tooltip placement="right">
            <a-icon type="info-circle"/>
            <template slot="title">{{ record['Id'] }}</template>
          </a-tooltip>
        </template>
        <!-- 容器挂载点 -->
        <template slot="Destination" slot-scope="text, record">
          {{ mountDestination(record['Mounts']) }}
        </template>
        <!-- 读写权限 -->
        <template slot="RW" slot-scope="text, record">
          <a-switch :disabled="true" :defaultChecked="mountReadWrite(record['Mounts'])">
            <a-icon type="check" slot="checkedChildren"/>
            <a-icon type="close" slot="unCheckedChildren"/>
          </a-switch>
        </template>
      </a-table>
    </a-card>
  </page-view>
</template>

<script>
  import { PageView } from '@/layouts'
  import { DetailList, CocoShield } from '@/components'
  import { invokeApi } from '@api/http'

  const DetailListItem = DetailList.Item

  export default {
    name: 'VolumeDetails',
    components: {
      CocoShield,
      PageView,
      DetailList,
      DetailListItem
    },
    data() {
      return {
        volumeInspect: null,
        detailsOption: {
          desc: []
        },
        containersOption: {
          columns: [
            {
              title: '容器名称',
              dataIndex: 'Name',
              sorter: true,
              scopedSlots: { customRender: 'Name' },
              ellipsis: true
            },
            {
              title: '容器挂载点',
              dataIndex: 'Destination',
              sorter: true,
              scopedSlots: { customRender: 'Destination' },
              ellipsis: true
            },
            {
              title: '读写权限',
              dataIndex: 'RW',
              sorter: true,
              scopedSlots: { customRender: 'RW' },
              ellipsis: true
            }
          ],
          data: []
        }
      }
    },
    methods: {
      inspectVolume(params) {
        invokeApi('/volume/inspect', params).then(response => {
          if (response.code === 2000) {
            this.volumeInspect = response.data
            this.buildDetails()
            this.buildUsedContainer()
          }
        })
      },
      removeVolume() {},
      buildDetails() {
        this.detailsOption.desc.push(
          {
            label: '卷名称',
            value: this.volumeInspect['Name'],
            prop: 'name'
          },
          {
            label: '宿主机挂载点',
            value: this.volumeInspect['Mountpoint'],
            prop: 'mountPoint'
          },
          {
            label: '驱动',
            value: this.volumeInspect['Driver'],
            prop: 'driver'
          },
          {
            label: '创建时间',
            value: this.volumeInspect['CreatedAt'],
            prop: 'createdAt'
          },
          {
            label: '标签',
            value: this.volumeInspect['Labels'],
            prop: 'labels'
          }
        )
      },
      buildUsedContainer() {
        const params = {
          filter: {
            all: true,
            volume: this.volumeName
          }
        }
        invokeApi('/container/list', params).then(response => {
          if (response.code === 2000) {
            this.containersOption.data = response.data.data
          }
        })
      },
      mountDestination(mounts) {
        return mounts.find(item => item['Type'] === 'volume' && item['Name'] === this.volumeName)['Destination']
      },
      mountReadWrite(mounts) {
        const readOnly = mounts.find(item => item['Type'] === 'volume' && item['Name'] === this.volumeName)['RW']
        return readOnly !== null ? readOnly : false
      }
    },
    computed: {
      volumeName() {
        return this.$route.params.name
      }
    },
    watch: {
      imageId: {
        deep: true,
        immediate: true,
        handler() {
          if (Object.keys(this.$route.params).includes('name')) {
            const params = { volumeName: this.$route.params.name }
            this.inspectVolume(params)
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
