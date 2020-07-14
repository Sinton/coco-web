<template>
  <div class="icons-list">
    <icon-font :type="type"/>
  </div>
</template>

<script>
  import { Icon } from 'ant-design-vue'

  const IconFont = Icon.createFromIconfontCN({
    scriptUrl: 'http://at.alicdn.com/t/font_1929726_w4zrs7trly.js',
    spin: true
  })
  export default {
    components: {
      IconFont
    },
    props: {
      type: {
        type: String,
        default: 'coco-swarm-copy'
      }
    }
  }
</script>

<style scoped lang="less">
  .icons-list {
    .anticon {
      padding: 0;
      margin-left: -5px;
      margin-right: -5px;
      font-size: 18px;
    }
  }
</style>
