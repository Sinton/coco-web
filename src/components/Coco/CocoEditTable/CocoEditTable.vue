<template>
  <div>
    <a-table :columns="tableColumns"
             :dataSource="tableData"
             :pagination="false">
      <template v-for="(column, i) in tableColumns.map(columnItem => columnItem.dataIndex)" :slot="column" slot-scope="text, record">
        <template v-if="record.editable">
          <!-- 输入可编辑框 -->
          <a-input v-if="tableColumns[i].editType === 'input' && tableColumns[i] !== 'action'"
                   :key="column"
                   :value="text"
                   :placeholder="`${tableColumns[i].title}`"
                   style="margin: -5px 0"
                   @change="e => inputChanged(e.target.value, record.key, column)"/>
          <!-- 下拉选项可编辑框 -->
          <a-select v-else-if="tableColumns[i].editType === 'select'"
                    :key="column"
                    :value="text"
                    :default-value="editorSelectItemDefault[column] || text"
                    @change="selectChanged">
            <a-select-option v-for="option in editorSelectItem[column]"
                             :key="option.value"
                             :value="option.value">
              {{ option.text }}
            </a-select-option>
          </a-select>
        </template>
        <template v-else>{{ text }}</template>
      </template>
      <template slot="action" slot-scope="text, record">
        <template v-if="record.editable">
          <span v-if="record.isNew">
            <a-icon style="cursor: pointer" type="save" @click="saveEditorItem(record)">保存</a-icon>
            <a-divider type="vertical"/>
            <a-popconfirm title="是否要删除此行？" @confirm="removeEditorItem(record.key)"><a-icon style="cursor: pointer" type="delete">删除</a-icon></a-popconfirm>
          </span>
          <span v-else>
            <a-icon style="cursor: pointer" type="save" @click="saveEditorItem(record)">保存</a-icon>
            <a-divider type="vertical"/>
            <a-icon style="cursor: pointer" type="close" @click="cancelEditorItem(record.key)">取消</a-icon>
          </span>
        </template>
        <span v-else>
          <a-icon style="cursor: pointer" type="edit" @click="editEditorItem(record.key)">编辑</a-icon>
          <a-divider type="vertical"/>
          <a-popconfirm title="是否要删除此行？" @confirm="removeEditorItem(record.key)"><a-icon style="cursor: pointer" type="delete">删除</a-icon></a-popconfirm>
        </span>
      </template>
    </a-table>
    <div style="margin-top: 15px; text-align: right;">
      <a @click="addRowMap"><a-button shape="circle" type="primary" icon="plus" size="small" style="margin-right: 10px"></a-button>{{ addText }}</a>
    </div>
    <!--<a-button style="width: 100%; margin-top: 10px" type="dashed" icon="plus" @click="addRowMap">{{ addText }}</a-button>-->
  </div>
</template>

<script>

  export default {
    name: 'CocoEditTable',
    props: {
      apiName: {
        type: String,
        default: null
      },
      tableColumns: {
        type: Array,
        default: () => [{
          title: '',
          dataIndex: '',
          key: '',
          scopedSlots: { customRender: '' }
        }]
      },
      tableData: {
        type: Array,
        default: () => []
      },
      editorSelectItemDefault: {
        type: Object,
        default: () => {}
      },
      editorSelectItem: {
        type: Object,
        default: () => {}
      },
      addText: {
        type: String,
        default: '新增'
      }
    },
    data() {
      return {
        tableDataLoading: false
      }
    },
    methods: {
      // input编辑项输入变更
      inputChanged(value, key, column) {
        this.$emit('edit-input-change', value, key, column)
      },
      selectChanged(value, option) {
        console.log(value)
        console.log(option)
        this.$emit('select-change', value, option)
      },
      // 保存编辑项
      saveEditorItem(record) {
        this.tableDataLoading = true
        const varl = {}
        this.tableColumns.forEach(columnItem => {
          varl[columnItem.key || columnItem.dataIndex] = record[columnItem.key || columnItem.dataIndex]
        })
        console.log(varl)
        // const { containerPort, hostPort, protocol } = record
        // if (!containerPort || !hostPort || !protocol) {
        //   this.$notification.warning({ message: '保存失败', description: '请填写完整信息' })
        //   return
        // }
        // 进行接口请求
        // invokeApi(this.apiName, {}).then(response => {
        //   console.log(response)
        // })
        // 模拟网络请求、卡顿 800ms
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({ loop: false })
          }, 10)
        }).then(() => {
          const currRow = this.tableData.filter(item => item.key === record.key)[0]
          currRow.editable = false
          currRow.isNew = false
        }).finally(() => {
          this.tableDataLoading = false
        })
      },
      // 删除编辑项
      removeEditorItem(key) {
        this.$emit('on-remove-item', key)
      },
      editEditorItem(key) {
        const currRow = this.tableData.filter(item => item.key === key)[0]
        currRow.editable = !currRow.editable
      },
      // 取消编辑项
      cancelEditorItem(key) {
        const currRow = this.tableData.filter(item => item.key === key)[0]
        currRow.editable = false
      },
      // 新增可编辑行
      addRowMap() {
        this.$emit('on-add-item')
      }
    }
  }
</script>

<style scoped lang="less">
</style>
