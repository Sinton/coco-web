<template>
  <div>
    <a-alert type="info" :message="tip" :banner="true" style="margin-bottom: 10px"/>
    <coco-editor-table :columns="columns"
                       :data="secretData"
                       :button-text="'添加加密配置项映射'">
      <template slot="body" slot-scope="item">
        <template v-if="item.record['editable']">
          <a-select v-if="item.column['dataIndex'] === 'name'"
                    v-model="item.record['editor'][item.column['dataIndex']]"
                    style="margin: -6px 0; width: 300px;">
            <a-select-option v-for="secret in availableSecrets"
                             :key="secret['ID']"
                             :value="secret['Spec']['Name']">
              {{ secret['Spec']['Name'] }}
            </a-select-option>
          </a-select>
          <a-input v-else
                   v-model="item.record['editor'][item.column['dataIndex']]"
                   :placeholder="item.record['editor']['name'] | placeholder"
                   style="margin: -6px 0;"/>
        </template>
        <template v-else>{{ item.text }}</template>
      </template>
    </coco-editor-table>
  </div>
</template>

<script>
  import { CocoEditorTable } from '@/components/Coco'
  import { invokeApi } from '@/api/http'
  import { isNotEmpty } from '@/utils/util'

  export default {
    name: 'CreateServiceSecrets',
    components: {
      CocoEditorTable
    },
    props: {
      data: {
        type: Array,
        default: () => []
      }
    },
    filters: {
      placeholder(secretName) {
        if (isNotEmpty(secretName)) {
          return `/run/secrets/${secretName}`
        } else {
          return '/run/secrets/$SECRET_NAME'
        }
      }
    },
    data() {
      return {
        tip: '不定义挂载路径则默认将配置被挂载在容器的 /run/secrets/$SECRET_NAME 路径下',
        placeholder: '',
        columns: [
          {
            title: '加密配置项名称',
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
        secretData: [],
        availableSecrets: []
      }
    },
    methods: {
      loadSecrets() {
        invokeApi('/secret/list', {}).then(response => {
          if (response.code === 2000) {
            this.availableSecrets = response.data.data
          } else {
            this.$notification.warning({ message: '提示', description: response.data })
          }
        }).catch(() => {
          this.$notification.error({ message: '错误', description: '加载容器加密配置项发生异常' })
        })
      }
    },
    mounted() {
      this.loadSecrets()
    }
  }
</script>

<style scoped lang="less">
</style>
