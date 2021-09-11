<template>
  <coco-editor-table :columns="columns"
                     :data="configData"
                     :button-text="'添加配置项映射'">
    <template slot="body" slot-scope="item">
      <template v-if="item.record['editable']">
        <a-select v-if="item.column['dataIndex'] === 'name'"
                  v-model="item.record['editor'][item.column['dataIndex']]"
                  style="margin: -6px 0; width: 300px;"
                  @change="configChanged">
          <a-select-option v-for="config in availableConfigs"
                           :key="config['ID']"
                           :value="config['Spec']['Name']">
            {{ config['Spec']['Name'] }}
          </a-select-option>
        </a-select>
        <a-input v-else v-model="item.record['editor'][item.column['dataIndex']]" style="margin: -6px 0;"/>
      </template>
      <template v-else>{{ item.text }}</template>
    </template>
  </coco-editor-table>
</template>

<script>
  import { CocoEditorTable } from '@/components/Coco'
  import { invokeApi } from '@/api/http'

  export default {
    name: 'CreateServiceConfigs',
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
        availableConfigs: []
      }
    },
    methods: {
      configChanged(configName) {
      },
      loadConfigs() {
        invokeApi('/config/list', {}).then(response => {
          if (response.code === 2000) {
            this.availableConfigs = response.data.data
          } else {
            this.$notification.warning({ message: '提示', description: response.data })
          }
        }).catch(() => {
          this.$notification.error({ message: '错误', description: '加载容器配置项发生异常' })
        })
      }
    },
    mounted() {
      this.loadConfigs()
    }
  }
</script>

<style scoped lang="less">
</style>
