<template>
  <a-card :bordered="false" style="margin-bottom: 20px;" class="compact">
    <template slot="title"><a-icon type="bars"/> 存储卷</template>
    <a-table :columns="columns"
             :dataSource="volumes"
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
        <a style="float:left;">
          <a-button-group>
            <a-button type="primary" icon="check" size="small" :disabled="!changed" @click="apply">应用变更</a-button>
            <a-dropdown :disabled="!changed">
              <a-button type="default" icon="down" size="small"/>
              <a-menu slot="overlay">
                <a-menu-item @click="reset">重置变更</a-menu-item>
              </a-menu>
            </a-dropdown>
          </a-button-group>
        </a>
        <a><a-button shape="circle"
                     type="primary"
                     icon="plus"
                     size="small"
                     style="margin-right: 5px;"
                     @click="append"/>
          添加存储卷
        </a>
      </div>
    </a-table>
  </a-card>
</template>

<script>
  import { invokeApi } from '@api/http'

  export default {
    name: 'ServiceMounts',
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
        volumes: [],
        originalVolumes: [],
        volumeType: [{ text: '路径映射', value: 'bind' }, { text: '存储卷', value: 'volume' }],
        availableVolumes: [],
        changed: false
      }
    },
    methods: {
      renderData() {
        this.data.forEach(item => {
          const record = {
            volumeType: item['Type'],
            source: item['Source'],
            containerPath: item['Target'],
            readOnly: item['ReadOnly'] || false
          }
          record['editor'] = _.cloneDeep(record)
          record['editable'] = false
          this.volumes.push(record)
        })
        this.originalVolumes = _.cloneDeep(this.volumes)
      },
      append() {
        const record = { volumeType: 'bind', readOnly: false }
        record['editor'] = _.cloneDeep(record)
        record['editable'] = true
        this.volumes.push(record)
        this.changed = true
      },
      save(record) {
        record = Object.assign(record, record['editor'])
        record['editable'] = false
        this.changed = true
      },
      remove(record) {
        const index = this.volumes.indexOf(record)
        this.volumes.splice(index, 1)
        this.changed = true
      },
      apply() {
      },
      reset() {
        this.volumes = _.cloneDeep(this.originalVolumes)
        this.changed = false
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
    },
    watch: {
      data: {
        deep: true,
        immediate: true,
        handler() {
          if (!_.isEmpty(this.data)) {
            this.renderData()
          }
        }
      }
    }
  }
</script>

<style scoped lang="less">
</style>
