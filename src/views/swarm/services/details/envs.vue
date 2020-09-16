<template>
  <a-card :bordered="false" style="margin-bottom: 20px;" class="compact">
    <template slot="title"><a-icon type="bars"/> 环境变量</template>
    <a-table :columns="columns"
             :dataSource="envs"
             :pagination="false">
      <template v-for="column in columns" v-if="column.scopedSlots" :slot="column.dataIndex" slot-scope="text, record">
        <div :key="column.dataIndex">
          <a-input v-if="record.editable"
                   v-model="record['editor'][column.dataIndex]"
                   :disabled="column.dataIndex === 'name' && record['original']"
                   style="margin: -6px 0"/>
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
                     style="margin-right: 5px;"
                     @click="append"/>
          添加环境变量
        </a>
      </div>
    </a-table>
  </a-card>
</template>

<script>
  export default {
    name: 'ServiceEnvs',
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
            title: '变量名',
            dataIndex: 'name',
            scopedSlots: { customRender: 'name' }
          },
          {
            title: '变量值',
            dataIndex: 'value',
            scopedSlots: { customRender: 'value' }
          },
          {
            title: '操作',
            dataIndex: 'action',
            scopedSlots: { customRender: 'action' },
            width: 120
          }
        ],
        envs: [],
        originalEnvs: [],
        changed: false
      }
    },
    methods: {
      renderData() {
        this.data.forEach(item => {
          const record = { name: item.split('=')[0], value: item.split('=')[1] }
          record['editor'] = _.cloneDeep(record)
          record['editable'] = false
          record['original'] = true
          this.envs.push(record)
        })
        this.originalEnvs = _.cloneDeep(this.envs)
      },
      append() {
        const record = {}
        record['editor'] = _.cloneDeep(record)
        record['editable'] = true
        record['original'] = false
        this.envs.push(record)
        this.changed = true
      },
      save(record) {
        record = Object.assign(record, record['editor'])
        record['editable'] = false
        this.changed = true
      },
      remove(record) {
        const index = this.data.indexOf(record)
        this.envs.splice(index, 1)
        this.changed = true
      },
      apply() {
      },
      reset() {
        this.envs = _.cloneDeep(this.originalEnvs)
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
