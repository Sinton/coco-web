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
    rows: 22,
    fontSize: 14,
    fontFamily: 'Cascadia Code',
    cursorBlink: true,
    cursorStyle: 'bar',
    bellStyle: 'sound'
  })

  export default {
    name: 'CocoWebTerminal',
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
        default: false
      }
    },
    data() {
      return {
        command: ''
      }
    },
    methods: {
      initTerminal() {
        this.delegateEvent()
        terminal.open(this.$refs['terminal'])
        terminal.fit()
        terminal.toggleFullScreen(false)
        terminal.webLinksInit()
        this.$emit('write', terminal)
      },
      attachTerminal() {
        terminal.attach(this.socket, true, true)
        terminal.onKey(event => {
          const printable = !event.altKey && !event.altGraphKey && !event.ctrlKey && !event.metaKey
          switch (event.domEvent.keyCode) {
            // 回退格
            case 8:
              console.log(terminal._core)
              console.log(terminal._core.buffer)
              console.log(terminal._core.buffer.x)
              if (terminal._core.buffer.x > 2) {
                terminal.write('\b \b')
              }
              break
            // 制表
            case 9:
              console.log('补全命令', terminal.select(0, 1, 20))
              break
            // 回车
            case 13:
            case 108:
              this.sendCommand(this.command)
              this.command = ''
              break
            // 删除
            case 12:
              break
            default:
              if (printable) {
                this.command += event.key
                terminal.write(event.key)
              }
              break
          }
        })
      },
      delegateEvent() {
        if (this.socket !== null) {
          this.socket.on('disconnect', () => {
            terminal.writeln('断开连接')
          })
          this.socket.on('terminal', (data) => {
            terminal.writeln(data)
          })
        }
      },
      sendCommand(cmd) {
        const params = {
          tty: true,
          cmd: cmd
        }
        this.socket.emit('terminal', params)
      }
    },
    mounted() {
      this.initTerminal()
      if (this.attach) {
        this.attachTerminal()
      }
    }
  }
</script>

<style scoped lang="less">
</style>
