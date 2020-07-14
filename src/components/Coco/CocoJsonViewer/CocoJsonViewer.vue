<template>
  <a-modal :visible="visible"
           :title="title"
           :centered="true"
           :footer="null"
           :width="width"
           :mask-closable="false"
           @cancel="() => this.$emit('close')">
    <a-button-group>
      <a-button @click="() => this.stringify = false">结构化</a-button>
      <a-button @click="() => this.stringify = true">文本化</a-button>
    </a-button-group>
    <json-viewer :value="stringify ? JSON.stringify(inspect) : inspect"
                 :copyable="{copyText: '复制代码', copiedText: '已复制'}"
                 style="max-height: 550px; overflow-y: auto;"/>
  </a-modal>
</template>

<script>
  import JsonViewer from 'vue-json-viewer'

  export default {
    name: 'CocoJsonViewer',
    components: {
      JsonViewer
    },
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      title: {
        type: String,
        default: ''
      },
      width: {
        type: Number,
        default: 650
      },
      inspect: {
        type: Object,
        default: () => {}
      }
    },
    data() {
      return {
        stringify: false
      }
    }
  }
</script>

<style scoped lang="less">
</style>
