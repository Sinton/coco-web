<template>
  <div :class="className">
    <slot></slot>
  </div>
</template>

<script>
  export default {
    name: 'CocoTopic',
    props: {
      size: {
        type: String,
        default: 'default'
      },
      color: {
        type: String,
        default: 'primary'
      },
      subTitle: {
        type: String,
        default: null
      }
    },
    data() {
      return {
      }
    },
    computed: {
      className: {
        get() {
          return `topic topic-${this.color}`
        },
        set() {
        }
      }
    }
  }
</script>

<style scoped lang="less">
  .topic {
    text-indent: 5px;
  }
  .topic-primary {
    border-left: 5px solid #1890ff;
  }
  .topic-success {
    border-left: 5px solid #52c41a;
  }
  .topic-warning {
    border-left: 5px solid #faad14;
  }
  .topic-error {
    border-left: 5px solid #f5222d;
  }
</style>
