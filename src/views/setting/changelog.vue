<template>
  <page-view title="更新日志"></page-view>
</template>

<script>
  import { PageView } from '@/layouts'
  import { STable } from '@/components'
  import Draggable from 'vuedraggable'
  // import { invokeApi } from '@api/http'

  export default {
    name: 'Changelog',
    components: {
      PageView,
      STable,
      Draggable
    },
    data() {
      return {}
    }
  }
</script>

<style scoped lang="less">
</style>
