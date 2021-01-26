<template>
  <div class="exception">
    <div class="imgBlock">
      <div class="imgEle" :style="{backgroundImage: `url(${config.img})`}">
      </div>
    </div>
    <div class="content">
      <h1>{{ config.title }}</h1>
      <div class="desc"><a href="https://kuboard.cn/" target="_blank">{{ config.desc }}</a></div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Kubernetes',
    data() {
      return {
        config: {
          img: 'https://kuboard.cn/images/preview.gif',
          title: '建议使用Kuboard',
          desc: '立即跳转'
        }
      }
    }
  }
</script>

<style scoped lang="less">
</style>
