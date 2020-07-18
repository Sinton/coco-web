<template>
  <a-drawer :visible="visible"
            :title="title"
            :height="height"
            :placement="'bottom'"
            :bodyStyle="{padding: 0}"
            :mask-closable="false"
            @close="() => this.$emit('close')">
    <web-terminal style="max-height: 400px; overflow-y: auto;"
                  :host="host"
                  :port="port"
                  :socket="socket"
                  ref="terminalRef"/>
  </a-drawer>
</template>

<script>
  import WebTerminal from './WebTerminal'

  export default {
    name: 'CocoWebTerminal',
    components: { WebTerminal },
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      title: {
        type: String,
        default: ''
      },
      height: {
        type: Number,
        default: 450
      },
      host: {
        type: String,
        default: '127.0.0.1'
      },
      port: {
        type: String,
        default: '9099'
      },
      socket: {
        type: Object,
        default: null
      }
    },
    data() {
      return {}
    },
    methods: {
    },
    mounted() {
    }
  }
</script>

<style scoped lang="less">
</style>
