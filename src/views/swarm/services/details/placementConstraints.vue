<template>
  <a-card :bordered="false" style="margin-bottom: 20px;" class="compact">
    <template slot="title"><a-icon type="bars"/> 约束条件</template>
    <a-table :columns="columns"
             :dataSource="constraints"
             :pagination="false"
             :scroll="{y: 200}">
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
          添加约束条件
        </a>
      </div>
    </a-table>
  </a-card>
</template>

<script>
  export default {
    name: 'ServicePlacementConstraints',
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
            title: '名称',
            dataIndex: 'Name',
            sorter: true,
            scopedSlots: { customRender: 'Name' }
          },
          {
            title: '运算符',
            dataIndex: 'Operator',
            sorter: true,
            scopedSlots: { customRender: 'Operator' }
          },
          {
            title: '值',
            dataIndex: 'Value',
            sorter: true,
            scopedSlots: { customRender: 'Value' }
          },
          {
            title: '操作',
            dataIndex: 'action',
            width: 150,
            scopedSlots: { customRender: 'action' }
          }
        ],
        constraints: [],
        originalConstraints: [],
        changed: false
      }
    },
    methods: {
      renderData() {
        this.data.forEach(item => {
          const record = {
            Name: item.split(' ')[0],
            Operator: item.split(' ')[1],
            Value: item.split(' ')[2]
          }
          record['editor'] = _.cloneDeep(record)
          record['editable'] = false
          this.constraints.push(record)
        })
        this.originalConstraints = _.cloneDeep(this.constraints)
      },
      append() {
        const record = {}
        record['editor'] = {}
        record['editable'] = true
        this.constraints.push(record)
        this.changed = true
      },
      save(record) {
        record = Object.assign(record, record['editor'])
        record['editable'] = false
        this.changed = true
      },
      remove(record) {
        const index = this.constraints.indexOf(record)
        this.constraints.splice(index, 1)
        this.changed = true
      },
      apply() {
      },
      reset() {
        this.constraints = _.cloneDeep(this.originalConstraints)
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
