<template>
  <div>
    <div style="display: none">
      <a-select size="small" style="width: 110px" :defaultValue="defaultOptions.mode" @change="onLanguageChange">
        <a-select-option v-for="language in languages" :key="language">{{ language }}</a-select-option>
      </a-select>
      <a-select size="small" style="width: 90px" :defaultValue="defaultOptions.theme" @change="onThemeChange">
        <a-select-option v-for="theme in themes" :key="theme">{{ theme }}</a-select-option>
      </a-select>
    </div>
    <codemirror ref="codemirrorRef" :value="data" :options="cmOptions" @input="input"/>
  </div>
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
        defaultOptions: {
          tabSize: 4,
          smartIndent: true,
          theme: 'darcula',
          mode: 'text',
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
        },
        languages: ['javascript', 'go', 'markdown', 'nginx', 'php', 'python', 'sql', 'vue', 'xml', 'yaml'],
        themes: ['monokai', 'darcula', 'eclipse'],
        height: 500
      }
    },
    methods: {
      input(code) {
        this.$emit('input', code)
      },
      onLanguageChange(language) {
        this.defaultOptions['mode'] = language
      },
      onThemeChange(theme) {
        this.defaultOptions['theme'] = theme
      }
    },
    computed: {
      data() {
        return this.code
      },
      cmOptions() {
        return {
          ...this.defaultOptions,
          ...this.options
        }
      }
    }
  }
</script>

<style scoped lang="less">
  /deep/ .CodeMirror {
    height: 500px;
  }

  .ant-select {
    border-radius: 0;
  }
</style>
