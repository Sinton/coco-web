<template>
  <coco-editor-table :columns="columns"
                     :data="data"
                     :button-text="buttonText"
                     @save="() => this.$emit('changed')"
                     @remove="() => this.$emit('changed')">
    <slot name="applyOperation" slot="footerLeft"></slot>
  </coco-editor-table>
</template>

<script>
  import { CocoEditorTable } from '@/components/Coco'

  export default {
    name: 'CommonLabels',
    components: {
      CocoEditorTable
    },
    props: {
      data: {
        type: Array,
        default: () => []
      },
      buttonText: {
        type: String,
        default: '新增标签'
      }
    },
    data() {
      return {
        columns: [
          {
            title: '标签名',
            dataIndex: 'name',
            scopedSlots: { customRender: 'name' }
          },
          {
            title: '标签值',
            dataIndex: 'value',
            scopedSlots: { customRender: 'value' }
          },
          {
            title: '操作',
            dataIndex: 'action',
            scopedSlots: { customRender: 'action' },
            width: 130
          }
        ]
      }
    }
  }
</script>

<style scoped lang="less">
</style>
