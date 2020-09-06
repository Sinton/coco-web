<template>
  <a-table :columns="columns"
           :dataSource="data"
           :pagination="false"
           :scroll="{y: 200}">
    <template v-for="column in columns" v-if="column.scopedSlots" :slot="column.dataIndex" slot-scope="text, record">
      <div :key="column.dataIndex">
        <a-input v-if="record.editable"
                 v-model="record['editor'][column.dataIndex]"
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
      <a><a-button shape="circle"
                   type="primary"
                   icon="plus"
                   size="small"
                   style="margin-right: 5px"
                   @click="append"/>
        新增环境变量
      </a>
    </div>
  </a-table>
</template>

<script>
  export default {
    name: 'ContainerEnvs',
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
        ]
      }
    },
    methods: {
      append() {
        const record = {}
        record['editor'] = _.cloneDeep(record)
        record.editable = true
        this.data.push(record)
      },
      save(record) {
        record = Object.assign(record, record['editor'])
        record.editable = false
      },
      remove(record) {
        const index = this.data.indexOf(record)
        this.data.splice(index, 1)
      }
    }
  }
</script>

<style scoped lang="less">
</style>
