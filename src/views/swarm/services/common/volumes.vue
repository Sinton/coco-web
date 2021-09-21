<template>
  <coco-editor-table :columns="columns"
                     :data="data"
                     :button-text="'添加端口映射'"
                     :default-value="{ volumeType: 'bind' }"
                     @save="() => this.$emit('changed')"
                     @remove="() => this.$emit('changed')">
    <template slot="body" slot-scope="item">
      <template v-if="item.record['editable']">
        <!-- 存储卷类型 -->
        <a-select v-if="item.column['dataIndex'] === 'volumeType'"
                  v-model="item.record['editor'][item.column['dataIndex']]"
                  @change="selectChanged(item.record)"
                  style="margin: -6px 0; width: 100%">
          <a-select-option value="bind">路径映射</a-select-option>
          <a-select-option value="volume">存储卷</a-select-option>
        </a-select>
        <a-select v-else-if="item.column['dataIndex'] === 'source' && item.record['editor']['volumeType'] === 'volume'"
                  v-model="item.record['editor'][item.column['dataIndex']]"
                  placeholder="请选择存储卷"
                  style="margin: -6px 0; width: 100%">
          <a-select-option v-for="volume in availableVolumes"
                           :key="volume['Name']"
                           :value="volume['Name']">
            {{ volume['Name'] }}
          </a-select-option>
        </a-select>
        <a-input v-else-if="item.column['dataIndex'] === 'source' && item.record['editor']['volumeType'] === 'bind'"
                 v-model="item.record['editor'][item.column['dataIndex']]"
                 :allow-clear="true"
                 placeholder="请输入宿主机挂载点"
                 style="margin: -6px 0; width: 100%;"/>
        <!-- 读写权限 -->
        <a-switch v-else-if="item.column['dataIndex'] === 'readOnly'"
                  v-model="item.record['editor'][item.column['dataIndex']]">
          <a-icon slot="checkedChildren" type="check"/>
          <a-icon slot="unCheckedChildren" type="close"/>
        </a-switch>
        <a-input v-else
                 v-model="item.record['editor']['containerPath']"
                 :allow-clear="true"
                 placeholder="请输入容器挂载点"
                 style="margin: -6px 0; width: 100%;"/>
      </template>
      <template v-else>
        <a-switch v-if="item.column['dataIndex'] === 'readOnly'"
                  v-model="item.record[item.column['dataIndex']]"
                  :disabled="true">
          <a-icon slot="checkedChildren" type="check"/>
          <a-icon slot="unCheckedChildren" type="close"/>
        </a-switch>
        <template v-else-if="item.column['dataIndex'] === 'volumeType'">{{ item.text === 'volume' ? '存储卷' : '路径映射' }}</template>
        <template v-else>{{ item.text | truncate(32) }}</template>
      </template>
    </template>
    <slot name="applyOperation" slot="footerLeft"></slot>
  </coco-editor-table>
</template>

<script>
  import { CocoEditorTable } from '@/components/Coco'
  import { invokeApi } from '@api/http'

  export default {
    name: 'CommonServiceVolumes',
    components: {
      CocoEditorTable
    },
    props: {
      data: {
        type: Array,
        default: () => []
      }
    },
    data() {
      return {
        columns: [
          {
            title: '存储卷类型',
            dataIndex: 'volumeType',
            scopedSlots: { customRender: 'volumeType' },
            width: 130
          },
          {
            title: '存储卷名称 / 宿主机挂载点',
            dataIndex: 'source',
            scopedSlots: { customRender: 'source' },
            width: '100%'
          },
          {
            title: '容器挂载点',
            dataIndex: 'containerPath',
            scopedSlots: { customRender: 'containerPath' },
            width: '100%'
          },
          {
            title: '读写权限',
            dataIndex: 'readOnly',
            scopedSlots: { customRender: 'readOnly' },
            width: 120
          },
          {
            title: '操作',
            dataIndex: 'action',
            scopedSlots: { customRender: 'action' },
            width: 120
          }
        ],
        availableVolumes: []
      }
    },
    methods: {
      loadVolumes() {
        invokeApi('/volume/list', {}).then(response => {
          if (response.code === 2000) {
            this.availableVolumes = response.data.data
          } else {
            this.$notification.warning({ message: '警告', description: response.data })
          }
        }).catch(error => {
          this.$notification.error({ message: '错误', description: error })
        })
      },
      selectChanged(record) {
        this.$set(record['editor'], 'source', undefined)
      }
    },
    mounted() {
      this.loadVolumes()
    }
  }
</script>

<style scoped lang="less">
</style>
