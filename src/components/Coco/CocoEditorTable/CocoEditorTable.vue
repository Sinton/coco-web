<template>
  <a-table :columns="columns"
           :dataSource="data"
           :pagination="false"
           :scroll="{y: 200}"
           style="margin-bottom: 30px">
    <template v-for="column in columns" v-if="column.scopedSlots" :slot="column.dataIndex" slot-scope="text, record">
      <div :key="column.dataIndex">
        <template v-if="hasBodySlot">
          <slot name="body" :record="record" :column="column" :text="text"/>
        </template>
        <template v-else>
          <a-input v-if="record['editable']"
                   v-model="record['editor'][column.dataIndex]"
                   style="margin: -6px 0"/>
          <template v-else>{{ text }}</template>
        </template>
      </div>
    </template>
    <template slot="action" slot-scope="text, record">
      <div class="editable-row-operations">
          <span v-if="record['editable']">
            <a @click="() => save(record)">保存</a>
            <a-divider type="vertical"/>
            <a @click="() => cancel(record, data)">取消</a>
          </span>
        <span v-else>
            <a @click="() => record['editable'] = true">修改</a>
            <a-divider type="vertical"/>
            <a @click="() => remove(record, data)">移除</a>
          </span>
      </div>
    </template>
    <div slot="footer" style="text-align: right;">
      <slot name="footer"/>
      <a><a-button shape="circle"
                   type="primary"
                   icon="plus"
                   size="small"
                   style="margin-right: 5px"
                   @click="append(data)"/>
        {{ buttonText }}
      </a>
    </div>
  </a-table>
</template>

<script>
  export default {
    name: 'CocoEditorTable',
    props: {
      columns: {
        type: Array,
        default: () => []
      },
      data: {
        type: Array,
        default: () => []
      },
      buttonText: {
        type: String,
        default: '新增'
      }
    },
    data() {
      return {
        hasBodySlot: false
      }
    },
    methods: {
      append(data) {
        const record = {}
        record['editor'] = _.cloneDeep(record)
        record['editable'] = true
        data.push(record)
        this.$emit('append', record)
      },
      save(record) {
        record = Object.assign(record, record['editor'])
        record['editable'] = false
        this.$emit('save')
      },
      cancel(record, data) {
        const index = data.indexOf(record)
        if (_.isEmpty(record['name']) && _.isEmpty(record['value'])) {
          data.splice(index, 1)
          this.$emit('cancel', record, data)
        } else {
          record['editor']['name'] = record['name']
          record['editor']['value'] = record['value']
          record['editable'] = false
        }
      },
      remove(record, data) {
        const index = data.indexOf(record)
        data.splice(index, 1)
        this.$emit('remove')
      }
    },
    mounted() {
      if (this.$scopedSlots.body) {
        this.hasBodySlot = true
      }
    }
  }
</script>

<style scoped lang="less">
</style>
