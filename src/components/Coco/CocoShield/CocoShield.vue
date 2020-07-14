<template>
  <div class="coco-shield">
    <span class="coco-shield label">{{ label }}</span>
    <span style="vertical-align: middle;">
      <slot></slot>
    </span>
  </div>
</template>

<script>
  export default {
    name: 'CocoShield',
    components: {},
    props: {
      visible: {
        type: Boolean,
        default: true
      },
      label: {
        type: String,
        default: ''
      },
      color: {
        type: String,
        default: 'primary'
      },
      closable: {
        type: Boolean,
        default: false
      },
      radius: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {}
    },
    methods: {}
  }
</script>

<style scoped lang="less">
  .coco-shield {
    display: inline-block;
    vertical-align: middle;
    padding: 0 6px 0 0;
    margin: 6px;
    line-height: 16px;
    color: #fff;
    font-weight: 600;
    background-color: #52c41a;
    border-radius: 0;
    word-break: break-all;
    white-space: normal;

    .label {
      display: inline-block;
      vertical-align: middle;
      padding: 0 6px 0 6px;
      margin: 0 6px 0 0;
      line-height: 20px;
      color: #fff;
      font-weight: 500;
      text-shadow: 0 4px 8px rgba(36, 46, 66, .1);
      border-radius: 0;
      background-color: #36435c;
    }
  }
</style>
