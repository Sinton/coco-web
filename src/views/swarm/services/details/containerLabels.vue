<template>
  <a-card :bordered="false" style="margin-bottom: 20px;" class="compact">
    <template slot="title"><a-icon type="bars"/> 容器标签</template>
    <a-table :columns="columns"
             :dataSource="containerLabels"
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
          添加容器标签
        </a>
      </div>
    </a-table>
  </a-card>
</template>

<script>
  export default {
    name: 'ServiceContainerLabels',
    props: {
      data: {
        type: Object,
        default: () => {}
      }
    },
    data() {
      return {
        columns: [
          {
            title: '标签名',
            dataIndex: 'name',
            sorter: true,
            scopedSlots: { customRender: 'name' }
          },
          {
            title: '标签值',
            dataIndex: 'value',
            sorter: true,
            scopedSlots: { customRender: 'value' }
          },
          {
            title: '操作',
            dataIndex: 'action',
            width: 120,
            scopedSlots: { customRender: 'action' }
          }
        ],
        containerLabels: [],
        originalContainerLabels: [],
        changed: false
      }
    },
    methods: {
      renderData() {
        Object.keys(this.data).forEach(key => {
          const item = { name: key, value: this.data[key] }
          item['editor'] = _.cloneDeep(item)
          item['editable'] = false
          this.containerLabels.push(item)
        })
        this.originalContainerLabels = _.cloneDeep(this.containerLabels)
      },
      append() {
        const record = {}
        record['editor'] = {}
        record['editable'] = true
        this.containerLabels.push(record)
        this.changed = true
      },
      save(record) {
        record = Object.assign(record, record['editor'])
        record['editable'] = false
        this.changed = true
      },
      remove(record) {
        const index = this.containerLabels.indexOf(record)
        this.containerLabels.splice(index, 1)
        this.changed = true
      },
      apply() {
      },
      reset() {
        this.containerLabels = _.cloneDeep(this.originalContainerLabels)
        this.changed = false
      }
    },
    watch: {
      data: {
        deep: true,
        immediate: true,
        handler() {
          if (Object.keys(this.data).length > 0) {
            this.renderData()
          }
        }
      }
    }
  }
</script>

<style scoped lang="less">
</style>
