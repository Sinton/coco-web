<template>
  <coco-editor-table :columns="columns"
                     :data="data"
                     :button-text="'添加端口映射'"
                     :default-value="defaultValue"
                     @save="() => this.$emit('changed')"
                     @remove="() => this.$emit('changed')">
    <template slot="body" slot-scope="item">
      <template v-if="item.record['editable']">
        <a-input-number v-if="item.column['dataIndex'] !== 'protocol' && item.column['dataIndex'] !== 'publishMode'"
                        v-model="item.record['editor'][item.column['dataIndex']]"
                        :min="1"
                        :step="1"
                        style="margin: -6px 0; width: 100%;"/>
        <a-select v-else-if="item.column['dataIndex'] === 'protocol'"
                  v-model="item.record['editor'][item.column['dataIndex']]"
                  style="margin: -6px 0; width: 100px;">
          <a-select-option value="tcp">tcp</a-select-option>
          <a-select-option value="udp">udp</a-select-option>
        </a-select>
        <a-select v-else-if="item.column['dataIndex'] === 'publishMode'"
                  v-model="item.record['editor'][item.column['dataIndex']]"
                  style="margin: -6px 0; width: 100px;">
          <a-select-option value="ingress">ingress</a-select-option>
          <a-select-option value="host">host</a-select-option>
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
    name: 'CommonServicePorts',
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
            title: '宿主机映射端口',
            dataIndex: 'hostPort',
            scopedSlots: { customRender: 'hostPort' }
          },
          {
            title: '容器端口',
            dataIndex: 'containerPort',
            scopedSlots: { customRender: 'containerPort' }
          },
          {
            title: '协议',
            dataIndex: 'protocol',
            scopedSlots: { customRender: 'protocol' },
            width: 120
          },
          {
            title: '模式',
            dataIndex: 'publishMode',
            scopedSlots: { customRender: 'publishMode' },
            width: 120
          },
          {
            title: '操作',
            dataIndex: 'action',
            scopedSlots: { customRender: 'action' },
            width: 120
          }
        ],
        defaultValue: { protocol: 'tcp', publishMode: 'ingress' }
      }
    }
  }
</script>

<style scoped lang="less">
</style>
