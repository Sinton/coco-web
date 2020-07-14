<template>
  <page-view title="任务">
    <div class="drag-box">
      <div class="drag-box-item">
        <div class="item-title">todo</div>
        <draggable v-model="todo" @remove="removeHandle" :options="dragOptions">
          <transition-group tag="div" id="todo" class="item-ul">
            <div v-for="item in todo" :key="item.id" class="drag-list">
              {{ item.content }}
            </div>
          </transition-group>
        </draggable>
      </div>
      <div class="drag-box-item">
        <div class="item-title">doing</div>
        <draggable v-model="doing" @remove="removeHandle" :options="dragOptions">
          <transition-group tag="div" id="doing" class="item-ul">
            <div v-for="item in doing" :key="item.id" class="drag-list">
              {{ item.content }}
            </div>
          </transition-group>
        </draggable>
      </div>
      <div class="drag-box-item">
        <div class="item-title">done</div>
        <draggable v-model="done" @remove="removeHandle" :options="dragOptions">
          <transition-group tag="div" id="done" class="item-ul">
            <div v-for="item in done" :key="item.id" class="drag-list">
              {{ item.content }}
            </div>
          </transition-group>
        </draggable>
      </div>
    </div>
  </page-view>
</template>

<script>
  import { PageView } from '@/layouts'
  import { STable } from '@/components'
  // import { invokeApi } from '@api/http'
  import Draggable from 'vuedraggable'

  export default {
    name: 'About',
    components: {
      PageView,
      STable,
      Draggable
    },
    data() {
      return {
        dragOptions: {
          sort: true,
          scrollSpeed: 2,
          scroll: true,
          animation: 120,
          group: 'sortlist',
          ghostClass: 'dragable-ghost'
        },
        todo: [
          { id: 11, content: '开发图表组件' },
          { id: 12, content: '开发拖拽组件' },
          { id: 13, content: '开发权限测试组件' }
        ],
        doing: [
          { id: 21, content: '开发登录注册页面' },
          { id: 22, content: '开发头部组件' },
          { id: 23, content: '开发表格相关组件' },
          { id: 24, content: '开发表单相关组件' }
        ],
        done: [
          { id: 31, content: '初始化项目，生成工程目录，完成相关配置' },
          { id: 32, content: '开发项目整体框架' }
        ]
      }
    },
    methods: {
      removeHandle(event) {
        console.log(event)
      }
    }
  }
</script>

<style scoped lang="less">
  .drag-box {
    display: flex;
    user-select: none;
  }

  .drag-box-item {
    flex: 1;
    max-width: 330px;
    min-width: 300px;
    background-color: #eff1f5;
    margin-right: 16px;
    border-radius: 6px;
    border: 1px #e1e4e8 solid;
  }

  .item-title {
    padding: 8px 8px 8px 12px;
    font-size: 14px;
    line-height: 1.5;
    color: #24292e;
    font-weight: 600;
  }

  .item-ul {
    padding: 0 8px 8px;
    height: 500px;
    overflow-y: scroll;
  }

  .item-ul::-webkit-scrollbar {
    width: 0;
  }

  .drag-list {
    border: 1px #e1e4e8 solid;
    padding: 10px;
    margin: 5px 0 10px;
    list-style: none;
    background-color: #fff;
    border-radius: 6px;
    cursor: pointer;
    -webkit-transition: border .3s ease-in;
    transition: border .3s ease-in;
  }

  .drag-list:hover {
    border: 1px solid #20a0ff;
  }

  .drag-title {
    font-weight: 400;
    line-height: 25px;
    margin: 10px 0;
    font-size: 22px;
    color: #1f2f3d;
  }

  .dragable-ghost {
    display: block;
    color: transparent;
    border-style: dashed
  }
</style>
