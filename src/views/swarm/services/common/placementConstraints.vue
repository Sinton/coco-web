<template>
  <coco-editor-table :columns="columns"
                     :data="data"
                     :button-text="'添加约束条件'"
                     :default-value="{ operator: '==' }"
                     @save="() => this.$emit('changed')"
                     @remove="() => this.$emit('changed')">
    <template slot="body" slot-scope="item">
      <template v-if="item.record['editable']">
        <a-input v-if="item.column['dataIndex'] !== 'operator'"
                 v-model="item.record['editor'][item.column['dataIndex']]"
                 style="margin: -6px 0; width: 100%;"/>
        <a-select v-else-if="item.column['dataIndex'] === 'operator'"
                  v-model="item.record['editor'][item.column['dataIndex']]"
                  style="margin: -6px 0; width: 100%;">
          <a-select-option value="==">==</a-select-option>
          <a-select-option value="!=">!=</a-select-option>
        </a-select>
      </template>
      <template v-else>{{ item.text }}</template>
    </template>
    <slot name="applyOperation" slot="footerLeft"></slot>
  </coco-editor-table>
</template>

<script>
  import { CocoEditorTable } from '@/components/Coco'

  export default {
    name: 'CommonServicePlacementConstraints',
    components: {
      CocoEditorTable
    },
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
            dataIndex: 'name',
            sorter: true,
            scopedSlots: { customRender: 'name' }
          },
          {
            title: '运算符',
            dataIndex: 'operator',
            scopedSlots: { customRender: 'operator' }
          },
          {
            title: '值',
            dataIndex: 'value',
            scopedSlots: { customRender: 'value' }
          },
          {
            title: '操作',
            dataIndex: 'action',
            width: 120,
            scopedSlots: { customRender: 'action' }
          }
        ]
      }
    }
  }
</script>

<style scoped lang="less">
</style>
