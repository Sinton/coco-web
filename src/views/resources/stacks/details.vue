<template>
  <page-view>
    <a-card :bordered="false" title="应用栈详情" style="margin-bottom: 20px;">
    </a-card>
    <container-list :filter="filter"/>
  </page-view>
</template>

<script>
  import { PageView } from '@/layouts'
  import ContainerList from '@/views/resources/containers/list'
  import { isNotEmpty } from '@/utils/util'

  export default {
    name: 'StackDetails',
    components: {
      ContainerList,
      PageView
    },
    data() {
      return {}
    },
    methods: {},
    computed: {
      filter() {
        const label = {}
        label['com.docker.compose.project'] = this.$route.params.name
        return {
          label: label
        }
      }
    }
  }
</script>

<style scoped lang="less">
</style>
