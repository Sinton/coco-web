<template>
  <a-modal v-model="visibleInspect"
           :title="'容器摘要'"
           :centered="true"
           :mask-closable="false"
           :footer="null"
           :after-close="() => this.$emit('after-close')"
           width="650px">
    <a-button-group>
      <a-button @click="() => this.stringify = false">结构化</a-button>
      <a-button @click="() => this.stringify = true">文本化</a-button>
    </a-button-group>
    <json-viewer :value="stringify ? JSON.stringify(inspectData) : inspectData"
                 :copyable="{copyText: '复制代码', copiedText: '已复制'}"
                 style="max-height: 550px; overflow-y: auto;"/>
  </a-modal>
</template>

<script>
  import { JsonViewer } from '@/components'

  export default {
    name: 'ContainerInspect',
    components: {
      JsonViewer
    },
    props: {
      value: {
        type: Boolean,
        default: false
      },
      inspectData: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    data() {
      return {
        stringify: false
      }
    },
    computed: {
      visibleInspect: {
        get() {
          return this.value
        }
      }
    }
  }
</script>

<style scoped lang="less">
</style>
