<template>
  <coco-editor-table :columns="columns" :data="data" :button-text="'添加环境变量'" @save="() => this.$emit('changed')">
    <slot name="applyOperation" slot="footerLeft"></slot>
  </coco-editor-table>
</template>

<script>
  import { CocoEditorTable } from '@/components/Coco'

  export default {
    name: 'CommonServiceEnvs',
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
    }
  }
</script>

<style scoped lang="less">
</style>
