<template>
  <a-card :bordered="false" style="margin-bottom: 20px;" class="compact">
    <template slot="title"><a-icon type="bars"/> 端口映射</template>
    <a-table :columns="columns"
             :dataSource="ports"
             :pagination="false"
             :scroll="{y: 200}">
      <template v-for="column in columns" v-if="column.scopedSlots" :slot="column.dataIndex" slot-scope="text, record">
        <div :key="column.dataIndex">
          <template v-if="record.editable">
            <a-input-number v-if="column.dataIndex !== 'protocol' && column.dataIndex !== 'publishMode'"
                            v-model="record['editor'][column.dataIndex]"
                            :min="1"
                            :step="1"
                            style="margin: -6px 0; width: 100%;"/>
            <a-select v-else-if="column.dataIndex === 'protocol'"
                      v-model="record['editor'][column.dataIndex]"
                      style="margin: -6px 0; width: 100px;">
              <a-select-option value="tcp">tcp</a-select-option>
              <a-select-option value="udp">udp</a-select-option>
            </a-select>
            <a-select v-else-if="column.dataIndex === 'publishMode'"
                      v-model="record['editor'][column.dataIndex]"
                      style="margin: -6px 0; width: 100px;">
              <a-select-option value="ingress">ingress</a-select-option>
              <a-select-option value="host">host</a-select-option>
            </a-select>
          </template>
          <template v-else>{{ text }}</template>
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
                     style="margin-right: 5px"
                     @click="append"/>
          添加端口映射
        </a>
      </div>
    </a-table>
  </a-card>
</template>

<script>
  import { invokeApi } from '@api/http'

  export default {
    name: 'ServicePorts',
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
            title: '宿主机映射端口',
            dataIndex: 'hostPort',
            scopedSlots: { customRender: 'hostPort' }
          },
          {
            title: '容器端口',
            dataIndex: 'containerPort',
            scopedSlots: { customRender: 'containerPort' }
          },
          {
            title: '协议',
            dataIndex: 'protocol',
            scopedSlots: { customRender: 'protocol' },
            width: 120
          },
          {
            title: '模式',
            dataIndex: 'publishMode',
            scopedSlots: { customRender: 'publishMode' },
            width: 120
          },
          {
            title: '操作',
            dataIndex: 'action',
            scopedSlots: { customRender: 'action' },
            width: 120
          }
        ],
        ports: [],
        originalPorts: [],
        changed: false
      }
    },
    methods: {
      renderData() {
        this.data.forEach(item => {
          const record = {
            hostPort: item['PublishedPort'],
            containerPort: item['TargetPort'],
            protocol: item['Protocol'],
            publishMode: item['PublishMode']
          }
          record['editor'] = _.cloneDeep(record)
          record['editable'] = false
          this.ports.push(record)
        })
        this.originalPorts = _.cloneDeep(this.ports)
      },
      append() {
        const record = { protocol: 'tcp', publishMode: 'ingress' }
        record['editor'] = _.cloneDeep(record)
        record['editable'] = true
        this.ports.push(record)
        this.changed = true
      },
      save(record) {
        record = Object.assign(record, record['editor'])
        record['editable'] = false
        this.changed = true
      },
      remove(record) {
        const index = this.ports.indexOf(record)
        this.ports.splice(index, 1)
        this.changed = true
      },
      apply() {
        const params = {}
        invokeApi('', params).then((response) => {
        }).catch(() => {
        })
      },
      reset() {
        this.ports = _.cloneDeep(this.originalPorts)
        this.changed = false
      }
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
