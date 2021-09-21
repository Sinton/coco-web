<template>
  <a-table :columns="columns"
           :dataSource="data"
           :pagination="false"
           :scroll="{y: 200}">
    <template v-for="column in columns" v-if="column.scopedSlots" :slot="column.dataIndex" slot-scope="text, record">
      <div :key="column.dataIndex">
        <template v-if="hasBodySlot">
          <slot name="body" :record="record" :column="column" :text="text"/>
        </template>
        <template v-else>
          <a-input v-if="record['editable']"
                   v-model="record['editor'][column.dataIndex]"
                   :allow-clear="true"
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
            <a-popconfirm @confirm="() => remove(record, data)">
              <template slot="title">确定要进行移除？</template>
              <a>移除</a>
            </a-popconfirm>
          </span>
      </div>
    </template>
    <div slot="footer" style="text-align: right;">
      <slot v-if="hasFooterSlot" name="footer"/>
      <template v-else>
        <a style="float:left;">
          <slot v-if="hasFooterLeftSlot" name="footerLeft"/>
        </a>
        <a><a-button shape="circle"
                     type="primary"
                     icon="plus"
                     size="small"
                     style="margin-right: 5px"
                     @click="append(data)"/>
          {{ buttonText }}
        </a>
      </template>
    </div>
  </a-table>
</template>

<script>
  import { isEmpty, isFunction, cloneDeep } from '@/utils/util'

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
      },
      defaultValue: {
        type: Object,
        default: () => {}
      }
    },
    data() {
      return {
      }
    },
    methods: {
      append(data) {
        const record = {}
        record['editor'] = cloneDeep(record)
        record['editor'] = Object.assign(record['editor'], this.defaultValue)
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
        if (isEmpty(record['name']) && isEmpty(record['value'])) {
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
    computed: {
      hasBodySlot() {
        return isFunction(this.$scopedSlots.body)
      },
      hasFooterSlot() {
        return isFunction(this.$scopedSlots.footer)
      },
      hasFooterLeftSlot() {
        return isFunction(this.$scopedSlots.footerLeft)
      }
    }
  }
</script>

<style scoped lang="less">
</style>
