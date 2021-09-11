<template>
  <coco-editor-table :columns="columns"
                     :data="constraints"
                     :button-text="'添加约束条件'">
    <template slot="body" slot-scope="item">
      <template v-if="item.record['editable']">
        <a-input v-if="item.column['dataIndex'] !== 'Operator'"
                 v-model="item.record['editor'][item.column['dataIndex']]"/>
        <a-select v-else-if="item.column['dataIndex'] === 'Operator'"
                  v-model="item.record['editor'][item.column['dataIndex']]"
                  style="width: 100px;">
          <a-select-option value="==">==</a-select-option>
          <a-select-option value="!=">!=</a-select-option>
        </a-select>
      </template>
      <template v-else>{{ item.text }}</template>
    </template>
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
            dataIndex: 'Name',
            sorter: true,
            scopedSlots: { customRender: 'Name' }
          },
          {
            title: '运算符',
            dataIndex: 'Operator',
            scopedSlots: { customRender: 'Operator' }
          },
          {
            title: '值',
            dataIndex: 'Value',
            scopedSlots: { customRender: 'Value' }
          },
          {
            title: '操作',
            dataIndex: 'action',
            width: 150,
            scopedSlots: { customRender: 'action' }
          }
        ],
        constraints: []
      }
    },
    methods: {
      renderData() {
        this.data.forEach(item => {
          this.constraints.push({
            Name: item.split(' ')[0],
            Operator: item.split(' ')[1],
            Value: item.split(' ')[2]
          })
        })
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
