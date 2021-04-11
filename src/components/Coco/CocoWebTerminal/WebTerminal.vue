<template>
  <div id="terminal" ref="terminal"></div>
</template>

<script>
  import 'xterm/lib/xterm.css'
  import 'xterm/lib/addons/fullscreen/fullscreen.css'
  import { Terminal } from 'xterm'
  import * as attach from 'xterm/lib/addons/attach/attach'
  import * as fit from 'xterm/lib/addons/fit/fit'
  import * as webLinks from 'xterm/lib/addons/webLinks/webLinks'
  import * as search from 'xterm/lib/addons/search/search'
  import * as fullscreen from 'xterm/lib/addons/fullscreen/fullscreen'

  Terminal.applyAddon(attach)
  Terminal.applyAddon(fit)
  Terminal.applyAddon(fullscreen)
  Terminal.applyAddon(webLinks)
  Terminal.applyAddon(search)
  const terminal = new Terminal({
    rows: 30,
    fontSize: 14,
    fontFamily: 'Cascadia Code',
    cursorBlink: true,
    cursorStyle: 'block',
    bellStyle: 'sound',
    screenKeys: true
  })

  export default {
    name: 'WebTerminal',
    props: {
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
      },
      attach: {
        type: Boolean,
        default: true
      },
      sendSocketEvent: {
        type: String,
        default: 'terminal'
      },
      receiveSocketEvent: {
        type: String,
        default: 'terminal'
      },
      extendParams: {
        type: Object,
        default: () => {}
      }
    },
    data() {
      return {}
    },
    methods: {
      initTerminal() {
        this.delegateEvent()
        terminal.open(this.$refs['terminal'])
        terminal.fit()
        terminal.toggleFullScreen(false)
        terminal.webLinksInit()
      },
      attachTerminal() {
        terminal.on('data', (command) => {
          let params = {'operate': 'command', 'command': command}
          params = { ...params, ...this.extendParams }
          this.socket.emit(this.sendSocketEvent, params)
        })
      },
      delegateEvent() {
        if (this.sockets !== null) {
          this.sockets.listener.subscribe('disconnect', () => {
            // TODO 断开WebSocket连接
          })
          this.sockets.listener.subscribe(this.receiveSocketEvent, (data) => {
            terminal.write(data)
          })
        }
      }
    },
    mounted() {
      this.initTerminal()
      if (this.attach) {
        this.attachTerminal()
      } else {
        this.$emit('write', terminal)
      }
    }
  }
</script>

<style scoped lang="less">
</style>
