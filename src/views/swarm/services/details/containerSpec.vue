<template>
  <a-card :bordered="false" style="margin-bottom: 20px;">
    <template slot="title"><a-icon type="bars"/> 容器规格</template>
    <a-list size="small" :dataSource="containerSpec">
      <a-list-item slot="renderItem" slot-scope="item">
        <a-col span="4">{{ item.label }}</a-col>
        <a-col span="6">{{ item.value === '' ? '-' : item.value }}</a-col>
        <a-col span="14">
          <a-alert type="info" :message="item.tips" banner/>
        </a-col>
      </a-list-item>
    </a-list>
  </a-card>
</template>

<script>
  export default {
    name: 'ServiceContainerSpec',
    props: {
      data: {
        type: Object,
        default: () => {}
      }
    },
    data() {
      return {
        containerSpec: []
      }
    },
    methods: {
      renderData() {
        this.containerSpec.push(
          { prop: 'Cmd', tips: '启动容器要执行的命令', label: '命令', value: this.data['Command'] || '' },
          { prop: 'Args', tips: '往容器内传递的命令参数', label: '命令参数', value: this.data['Args'] || '' },
          { prop: 'User', tips: '容器用户/UID', label: '权限用户', value: this.data['User'] || '' },
          { prop: 'Dir', tips: '容器内的工作目录', label: '工作目录', value: this.data['Dir'] || '' }
        )
      }
    },
    watch: {
      data: {
        deep: true,
        immediate: true,
        handler() {
          if (Object.keys(this.data).length > 0) {
            this.renderData()
          }
        }
      }
    }
  }
</script>

<style scoped lang="less">
</style>
