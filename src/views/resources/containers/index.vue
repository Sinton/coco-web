<template>
  <page-view logo="https://gw.alipayobjects.com/zos/rmsportal/nxkuOJlFJuAUhzlMTCEe.png">
    <container-list/>
  </page-view>
</template>

<script>
  import { PageView, RouteView } from '@/layouts'
  import ContainerList from '@/views/resources/containers/list'

  export default {
    name: 'Containers',
    components: {
      ContainerList,
      PageView,
      RouteView
    },
    data() {
      return {}
    }
  }
</script>

<style scoped lang="less">
  .detail-layout {
    margin-left: 44px;
  }
  .text {
    color: rgba(0, 0, 0, .45);
  }

  .heading {
    color: rgba(0, 0, 0, .85);
    font-size: 20px;
  }

  .no-data {
    color: rgba(0, 0, 0, .25);
    text-align: center;
    line-height: 64px;
    font-size: 16px;

    i {
      font-size: 24px;
      margin-right: 16px;
      position: relative;
      top: 3px;
    }
  }
</style>
