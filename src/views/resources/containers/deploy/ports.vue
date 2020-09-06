<template>
  <a-table :columns="columns"
           :dataSource="data"
           :pagination="false"
           :scroll="{y: 200}">
    <template v-for="column in columns" v-if="column.scopedSlots" :slot="column.dataIndex" slot-scope="text, record">
      <div :key="column.dataIndex">
        <template v-if="record.editable">
          <a-input-number v-if="column.dataIndex !== 'protocol'"
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
</template>

<script>
  export default {
    name: 'ContainerPorts',
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
            title: '容器端口',
            dataIndex: 'containerPort',
            scopedSlots: { customRender: 'containerPort' }
          },
          {
            title: '映射主机端口',
            dataIndex: 'hostPort',
            scopedSlots: { customRender: 'hostPort' }
          },
          {
            title: '协议',
            dataIndex: 'protocol',
            scopedSlots: { customRender: 'protocol' },
            width: 120
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
        const record = { protocol: 'tcp' }
        record['editor'] = _.cloneDeep(record)
        record.editable = true
        this.data.push(record)
      },
      handleChange(value, column, record) {
        record[column.dataIndex] = value
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
