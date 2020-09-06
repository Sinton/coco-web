<template>
  <page-view logo="https://gw.alipayobjects.com/zos/rmsportal/nxkuOJlFJuAUhzlMTCEe.png">
    <detail-list slot="headerContent" size="small" :col="2" class="detail-layout">
      <detail-list-item v-for="(desc, index) in imageData"
                        :key="index"
                        :term="desc.label">
        {{ desc.value }}
      </detail-list-item>
    </detail-list>
    <template slot="action">
      <a-button-group style="margin-right: 4px;">
        <a-button icon="delete" type="danger" size="small" @click="removeImage">删除</a-button>
        <a-button icon="download" type="primary" size="small">导出</a-button>
      </a-button-group>
    </template>

    <a-card :bordered="false" style="margin-bottom: 20px;">
      <span slot="title"><a-icon type="tags" style="margin-right: 5px;"/>镜像版本标签</span>
      <a-form :form="tagImageForm">
        <a-row :gutter="48">
          <a-col :lg="12" :md="12" :sm="24">
            <a-form-item v-bind="{labelCol: { span: 3 }, wrapperCol: { span: 21 }}" label="镜像名称">
              <a-input v-decorator="[ 'imageFullName' ]" placeholder="请输入镜像名称 eg: hello-world:latest"/>
            </a-form-item>
          </a-col>
          <a-col :lg="12" :md="12" :sm="24">
            <a-form-item v-bind="{labelCol: { span: 4 }, wrapperCol: { span: 20 }}" label="镜像Registry">
              <a-select v-decorator="['registry', {initialValue: 'DockerHub', rules: [{ required: true, message: '请选择镜像Registry'}]}]"
                        placeholder="请选择镜像Registry">
                <a-select-option value="DockerHub">DockerHub</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <a-tag v-for="(tag, index) in tags"
             :key="index"
             :closable="true"
             @close="removeImage(null, false, true, true, tag)"
             color="#108ee9"
             size="large">
        {{ tag }}
      </a-tag>
      <br>
      <a-button :disabled="!(tagImageForm.getFieldsValue()['imageFullName'] && tagImageForm.getFieldsValue()['imageFullName'].length > 0)"
                @click="tagImage"
                style="margin-top: 10px"
                type="primary">
        标签
      </a-button>
    </a-card>

    <a-card :title="'Dockerfile 详情'" :bordered="false" style="margin-bottom: 25px">
      <a-list size="small" :dataSource="dockerfileData">
        <a-list-item slot="renderItem" slot-scope="item">
          <a-col span="2">{{ item.label }}</a-col>
          <a-col span="22">
            <template v-if="item.prop === 'Cmd' && item.value !== null">
              <a-tag>{{ item.value.join(' ') }}</a-tag>
            </template>
            <template v-else-if="item.prop === 'Entrypoint' && item.value !== null">
              <a-tag v-for="entrypoint in item.value" :key="entrypoint">{{ entrypoint }}</a-tag>
            </template>
            <template v-else-if="item.prop === 'ExposedPorts' && item.value !== null">
              <a-tag v-for="expose in item.value" :key="expose">{{ expose }}</a-tag>
            </template>
            <template v-else-if="item.prop === 'Volumes' && item.value !== null">
              <a-tag v-for="volume in item.value" :key="volume">{{ volume }}</a-tag>
            </template>
            <template v-else-if="item.prop === 'Env'">
              <a-table :show-header="false"
                       :columns="kvColumns"
                       :dataSource="item.value"
                       :pagination="false"
                       :size="'small'"
                       style="width: 100%"/>
            </template>
          </a-col>
        </a-list-item>
      </a-list>
    </a-card>

    <a-card :title="'镜像文件层'" :bordered="false" style="margin-bottom: 20px;" class="compact">
      <s-table ref="imageLayersRef"
               rowKey="key"
               size="middle"
               :columns="layerOption.columns"
               :data="loadImageHistory"
               :showPagination="false">
        <template slot="No" slot-scope="text, record, index">
          {{ index }}
        </template>
        <template slot="Created" slot-scope="text">
          {{ text * 1000 | moment }}
        </template>
        <template slot="Size" slot-scope="text">
          {{ text | size }}
        </template>
        <template slot="CreatedBy" slot-scope="text">
          {{ text | imageLayerConvert | truncate(120) }}
          <a-tooltip v-if="text.length > 120" placement="right">
            <a-icon type="info-circle"/>
            <template slot="title">{{ text }}</template>
          </a-tooltip>
        </template>
      </s-table>
    </a-card>
  </page-view>
</template>

<script>
  import { PageView } from '@/layouts'
  import { STable, DetailList } from '@/components'
  import { convertSize } from '@/utils/util'
  import { invokeApi } from '@/api/http'
  import { common } from '@/mixins'

  const DetailListItem = DetailList.Item

  export default {
    name: 'ImageDetails',
    components: {
      PageView,
      STable,
      DetailList,
      DetailListItem
    },
    mixins: [common.base],
    data() {
      return {
        tags: [],
        tagImageForm: this.$form.createForm(this),
        imageData: [],
        dockerfileData: [],
        layerOption: {
          columns: [
            {
              title: '#',
              scopedSlots: { customRender: 'No' },
              width: 40
            },
            {
              title: '创建于',
              dataIndex: 'Created',
              sorter: true,
              scopedSlots: { customRender: 'Created' },
              ellipsis: true,
              width: 160
            },
            {
              title: '文件层容量大小',
              dataIndex: 'Size',
              sorter: true,
              scopedSlots: { customRender: 'Size' },
              ellipsis: true,
              width: 140
            },
            {
              title: '文件层',
              dataIndex: 'CreatedBy',
              sorter: true,
              scopedSlots: { customRender: 'CreatedBy' },
              ellipsis: true
            }
          ],
          data: null
        }
      }
    },
    filters: {
      imageLayerConvert(createdBy) {
        return createdBy.replace('/bin/sh -c #(nop) ', '').replace('/bin/sh -c ', 'RUN ')
      }
    },
    methods: {
      getImage() {
        const params = { imageId: `sha256:${this.imageId}` }
        invokeApi('/image/get', params).then(response => {
          if (response.code === 2000) {
            if (!_.isEmpty(response.data['RepoTags'])) {
              this.tags = response.data['RepoTags']
            }
          } else {
            this.$notification.error({ message: '警告', description: response.code })
          }
        })
      },
      inspectImage(params) {
        invokeApi('/image/inspect', params).then(response => {
          if (response.code === 2000) {
            this.imageData = []
            this.imageData.push({
              label: '镜像ID',
              value: response.data['Id']
            }, {
              label: '大小',
              value: convertSize(response.data.Size)
            }, {
              label: '构建时间',
              value: response.data['Created']
            }, {
              label: '构建版本',
              value: `Docker ${response.data['DockerVersion']} on ${response.data['Os']}, ${response.data['Architecture']}`
            })

            this.dockerfileData = []
            this.dockerfileData.push({
              label: '命令',
              value: response.data['Config']['Cmd'] || null,
              prop: 'Cmd'
            }, {
              label: '启动入口',
              value: response.data['Config']['Entrypoint'] || null,
              prop: 'Entrypoint'
            }, {
              label: '映射端口',
              value: response.data['Config']['ExposedPorts'] || null,
              prop: 'ExposedPorts'
            }, {
              label: '挂载卷',
              value: response.data['Config']['Volumes'] || null,
              prop: 'Volumes'
            }, {
              label: '环境变量',
              value: this.convertEnv(response.data['Config']['Env']),
              prop: 'Env'
            })
          } else {
            this.$notification.error({ message: '警告', description: '加载数据失败' })
          }
        })
      },
      tagImage() {
        if (!this.tags.includes(_.trim(this.tagImageForm.getFieldsValue()['imageFullName']))) {
          const params = {
            imageId: this.imageId,
            imageFullName: `${this.tagImageForm.getFieldsValue()['imageFullName']}`
          }
          invokeApi('/image/tag', params).then(response => {
            if (response.code === 2000) {
              this.tags.push(_.trim(this.tagImageForm.getFieldsValue()['imageFullName']))
            } else {
              this.$notification.error({ message: '警告', description: '标签镜像失败' })
            }
          })
        }
      },
      removeImage(event, force = false, noPrune = true, unTag = false, imageName) {
        const params = {
          imageId: unTag ? imageName : this.imageId,
          force: force,
          noPrune: noPrune
        }
        invokeApi('/image/remove', params).then(response => {
          if (response.code === 2000) {
            this.$router.push('/resources/images')
          } else {
            this.$notification.warning({ message: '警告', description: '删除镜像失败' })
          }
        }).catch(error => {
          this.$notification.error({ message: '错误', description: error })
        })
      },
      loadImageHistory() {
        return invokeApi('/image/history', { imageId: this.imageId }).then(response => {
          if (response.code === 2000) {
            return {
              data: response.data.reverse(),
              pageNo: 1,
              pageSize: 999,
              totalCount: response.data.length,
              totalPage: 1
            }
          } else {
            this.$notification.warning({ message: '警告', description: '加载Dockerfile镜像历史文件层失败' })
          }
        })
      }
    },
    computed: {
      imageId() {
        return this.$route.params.id
      }
    },
    watch: {
      imageId: {
        deep: true,
        immediate: true,
        handler() {
          if (Object.keys(this.$route.params).includes('id')) {
            const params = { imageId: this.$route.params.id }
            this.inspectImage(params)
            this.getImage()
          }
        }
      }
    }
  }
</script>

<style scoped lang="less">
  /deep/ .compact .ant-card-body {
    padding: 0;
  }
</style>
