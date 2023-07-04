<template>
  <coco-editor-table :columns="columns"
                     :data="data"
                     :button-text="'添加加密配置项'"
                     @append="append"
                     @save="() => this.$emit('changed')"
                     @remove="() => this.$emit('changed')">
    <template slot="body" slot-scope="item">
      <template v-if="item.record['editable']">
        <a-select v-if="item.column['dataIndex'] === 'name'"
                  v-model="item.record['editor'][item.column['dataIndex']]"
                  style="margin: -6px 0; width: 300px;"
                  @change="secretChanged">
          <a-select-option v-for="secret in availableSecrets"
                           :key="secret['ID']"
                           :value="secret['Spec']['Name']">
            {{ secret['Spec']['Name'] }}
          </a-select-option>
        </a-select>
        <a-input v-else-if="item.column['dataIndex'] === 'containerPath'"
                 v-model="item.record['editor'][item.column['dataIndex']]"
                 :placeholder="item.record['editor']['name'] | placeholder"
                 style="margin: -6px 0;"/>
        <template v-else>{{ item.text }}</template>
      </template>
      <template v-else>
        <template v-if="item.column['dataIndex'] === 'name'">
          <router-link :to="{ path: `/swarm/secrets` }">
            {{ item.text }}
          </router-link>
          <a-tooltip placement="right">
            <a-icon type="info-circle"/>
            <template slot="title">加密配置项ID: {{ item.record['id'] }}</template>
          </a-tooltip>
        </template>
        <template v-else>{{ item.text }}</template>
      </template>
    </template>
    <slot name="applyOperation" slot="footerLeft"></slot>
  </coco-editor-table>
</template>

<script>
  import { CocoEditorTable } from '@/components/Coco'
  import { invokeApi } from '@/api/http'
  import { cloneDeep, isNotEmpty } from '@/utils/util'

  export default {
    name: 'CommonServiceSecrets',
    components: {
      CocoEditorTable
    },
    props: {
      data: {
        type: Array,
        default: () => []
      },
      detailsMode: {
        type: Boolean,
        default: () => false
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
        placeholder: '',
        originalColumns: [
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
        availableSecrets: []
      }
    },
    methods: {
      append(record) {
        record['uid'] = '0'
        record['gid'] = '0'
        record['mode'] = 444
      },
      secretChanged(secretName) {
      },
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
    computed: {
      columns() {
        if (this.detailsMode) {
          const detailsElement = [
            {
              title: '用户',
              dataIndex: 'uid',
              scopedSlots: { customRender: 'uid' },
              width: 60
            },
            {
              title: '用户组',
              dataIndex: 'gid',
              scopedSlots: { customRender: 'gid' },
              width: 80
            },
            {
              title: '模式',
              dataIndex: 'mode',
              scopedSlots: { customRender: 'mode' },
              width: 60
            }
          ]
          const cols = cloneDeep(this.originalColumns)
          detailsElement.forEach(item => {
            cols.splice(-1, 0, item)
          })
          return cols
        } else {
          return this.originalColumns
        }
      }
    },
    mounted() {
      this.loadSecrets()
    }
  }
</script>

<style scoped lang="less">
</style>
