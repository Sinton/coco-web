<template>
  <codemirror ref="codemirrorRef" :value="data" :options="cmOptions" @input="input"/>
</template>

<script>
  import { codemirror } from 'vue-codemirror'
  import 'codemirror/lib/codemirror.css'

  // language
  import 'codemirror/mode/go/go.js'
  import 'codemirror/mode/javascript/javascript.js'
  import 'codemirror/mode/markdown/markdown.js'
  import 'codemirror/mode/nginx/nginx.js'
  import 'codemirror/mode/php/php.js'
  import 'codemirror/mode/python/python.js'
  import 'codemirror/mode/sql/sql.js'
  import 'codemirror/mode/vue/vue.js'
  import 'codemirror/mode/xml/xml.js'
  import 'codemirror/mode/yaml/yaml.js'

  // theme
  import 'codemirror/theme/monokai.css'
  import 'codemirror/theme/darcula.css'
  import 'codemirror/theme/eclipse.css'

  // active-line
  import 'codemirror/addon/selection/active-line.js'

  // styleSelectedText
  import 'codemirror/addon/selection/mark-selection.js'
  import 'codemirror/addon/search/searchcursor.js'

  // hint
  import 'codemirror/addon/hint/show-hint.js'
  import 'codemirror/addon/hint/show-hint.css'
  import 'codemirror/addon/hint/javascript-hint.js'
  import 'codemirror/addon/selection/active-line.js'

  // highlightSelectionMatches
  import 'codemirror/addon/scroll/annotatescrollbar.js'
  import 'codemirror/addon/search/matchesonscrollbar.js'
  import 'codemirror/addon/search/searchcursor.js'
  import 'codemirror/addon/search/match-highlighter.js'

  // keyMap
  import 'codemirror/mode/clike/clike.js'
  import 'codemirror/addon/edit/matchbrackets.js'
  import 'codemirror/addon/edit/closebrackets'
  import 'codemirror/addon/comment/comment.js'
  import 'codemirror/addon/dialog/dialog.js'
  import 'codemirror/addon/dialog/dialog.css'
  import 'codemirror/addon/search/searchcursor.js'
  import 'codemirror/addon/search/search.js'
  import 'codemirror/keymap/emacs.js'
  import 'codemirror/keymap/sublime.js'
  import 'codemirror/keymap/vim.js'

  // foldGutter
  import 'codemirror/addon/fold/brace-fold.js'
  import 'codemirror/addon/fold/comment-fold.js'
  import 'codemirror/addon/fold/foldcode.js'
  import 'codemirror/addon/fold/foldgutter.css'
  import 'codemirror/addon/fold/foldgutter.js'
  import 'codemirror/addon/fold/indent-fold.js'
  import 'codemirror/addon/fold/markdown-fold.js'
  import 'codemirror/addon/fold/xml-fold.js'

  export default {
    name: 'CocoCodeMirror',
    components: {
      codemirror
    },
    props: {
      code: {
        type: String,
        default: () => ''
      },
      options: {
        type: Object,
        default: () => {}
      }
    },
    data() {
      return {
        cmOptions: {
          ...this.options,
          ...{
            tabSize: 4,
            smartIndent: true,
            theme: 'darcula',
            line: true,
            lineNumbers: true,
            fontFamily: 'Cascadia Code',
            styleSelectedText: true,
            showCursorWhenSelecting: true,
            matchBrackets: true,
            autoCloseBrackets: true,
            foldCode: true,
            foldGutter: true,
            gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
            keyMap: "sublime",
            extraKeys: { 'Ctrl': 'autocomplete' },
            hintOptions:{
              completeSingle: false
            },
            // readOnly: 'nocursor'
          }
        }
      }
    },
    methods: {
      input(code) {
        this.$emit('input', code)
      }
    },
    computed: {
      data() {
        return this.code
      }
    }
  }
</script>

<style scoped lang="less">
/deep/ .CodeMirror {
  height: 500px;
}
</style>
