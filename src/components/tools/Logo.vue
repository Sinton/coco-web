<template>
  <div class="logo">
    <router-link :to="{name:'dashboard'}">
      <LogoSvg alt="logo" />
      <h1 v-if="showTitle">{{ title }}</h1>
    </router-link>
  </div>
</template>

<script>
  import LogoSvg from '@/assets/icons/bx-analyse.svg?inline'

  export default {
    name: 'Logo',
    components: {
      LogoSvg
    },
    props: {
      title: {
        type: String,
        default: 'Coco',
        required: false
      },
      showTitle: {
        type: Boolean,
        default: true,
        required: false
      }
    }
  }
</script>
