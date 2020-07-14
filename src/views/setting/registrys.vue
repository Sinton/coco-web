<template>
  <page-view title="镜像仓库"></page-view>
</template>

<script>
  import { PageView } from '@/layouts'
  import { STable } from '@/components'
  import Draggable from 'vuedraggable'
  // import { invokeApi } from '@api/http'

  export default {
    name: 'Registrys',
    components: {
      PageView,
      STable,
      Draggable
    },
    data() {
      return {}
    },
    methods: {}
  }
</script>

<style scoped lang="less">
</style>
