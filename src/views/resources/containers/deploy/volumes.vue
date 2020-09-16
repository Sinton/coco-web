<template>
  <a-table :columns="columns"
           :dataSource="data"
           :pagination="false"
           :scroll="{y: 200}">
    <template v-for="column in columns" v-if="column.scopedSlots" :slot="column.dataIndex" slot-scope="text, record">
      <div :key="column.dataIndex">
        <template v-if="record.editable">
          <!-- 存储卷类型 -->
          <a-select v-if="column.dataIndex === 'volumeType'"
                    v-model="record['editor'].volumeType"
                    style="margin: -5px 0; width: 100%">
            <a-select-option v-for="type in volumeType"
                             :key="type.value"
                             :value="type.value">
              {{ type.text }}
            </a-select-option>
          </a-select>
          <a-select v-else-if="column.dataIndex === 'source' && record['editor'].volumeType === 'volume'"
                    v-model="record['editor'].source"
                    placeholder="请选择存储卷"
                    style="margin: -5px 0; width: 100%">
            <a-select-option v-for="volume in availableVolumes"
                             :key="volume['Name']"
                             :value="volume['Name']">
              {{ volume['Name'] }}
            </a-select-option>
          </a-select>
          <a-input v-else-if="column.dataIndex === 'source' && record['editor'].volumeType === 'bind'"
                   v-model="record['editor'].source"
                   placeholder="请输入宿主机挂载点"
                   style="margin: -5px 0; width: 100%;"/>
          <!-- 读写权限 -->
          <a-switch v-else-if="column.dataIndex === 'readOnly'"
                    v-model="record['editor'].readOnly">
            <a-icon slot="checkedChildren" type="check"/>
            <a-icon slot="unCheckedChildren" type="close"/>
          </a-switch>
          <a-input v-else
                   v-model="record['editor'].containerPath"
                   placeholder="请输入容器挂载点"
                   style="margin: -5px 0; width: 100%;"/>
        </template>
        <template v-else>
          <a-switch v-if="column.dataIndex === 'readOnly'"
                    v-model="record.readOnly"
                    :disabled="true">
            <a-icon slot="checkedChildren" type="check"/>
            <a-icon slot="unCheckedChildren" type="close"/>
          </a-switch>
          <template v-else-if="column.dataIndex === 'volumeType'">{{ text === 'volume' ? '存储卷' : '路径映射' }}</template>
          <template v-else>{{ text }}</template>
        </template>
      </div>
    </template>
    <template slot="action" slot-scope="text, record">
      <div class="editable-row-operations">
        <span v-if="record.editable">
          <a @click="() => save(record)">保存</a>
          <a-divider type="vertical"/>
          <a @click="() => record.editable = false">取消</a>
        </span>
        <span v-else>
          <a @click="() => record.editable = true">修改</a>
          <a-divider type="vertical"/>
          <a @click="() => remove(record)">移除</a>
        </span>
      </div>
    </template>
    <div slot="footer" style="text-align: right;">
      <a><a-button shape="circle"
                   type="primary"
                   icon="plus"
                   size="small"
                   style="margin-right: 5px"
                   @click="append"/>
        新增存储卷
      </a>
    </div>
  </a-table>
</template>

<script>
  import { invokeApi } from '@api/http'

  export default {
    name: 'ContainerVolumes',
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
        volumeType: [{ text: '路径映射', value: 'bind' }, { text: '存储卷', value: 'volume' }],
        availableVolumes: []
      }
    },
    methods: {
      append() {
        const record = { volumeType: 'bind', readOnly: false }
        record['editor'] = _.cloneDeep(record)
        record['editable'] = true
        this.data.push(record)
      },
      save(record) {
        record = Object.assign(record, record['editor'])
        record['editable'] = false
      },
      remove(record) {
        const index = this.data.indexOf(record)
        this.data.splice(index, 1)
      }
    },
    mounted() {
      invokeApi('/volume/list', {}).then(response => {
        if (response.code === 2000) {
          this.availableVolumes = response.data.data
        } else {
          this.$notification.warning({ message: '警告', description: response.data })
        }
      }).catch(error => {
        this.$notification.error({ message: '错误', description: error })
      })
    }
  }
</script>

<style scoped lang="less">
</style>
