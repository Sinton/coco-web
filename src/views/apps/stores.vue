<template>
  <page-view>
    <a-card :bordered="false" class="ant-pro-components-tag-select">
      <a-form :form="form" layout="inline">
        <standard-form-row title="所属类目" block style="padding-bottom: 11px;">
          <a-form-item>
            <tag-select>
              <tag-select-option v-for="category in categorys"
                                 :key="category.code"
                                 :value="category.code">
                {{ category.value }}
              </tag-select-option>
            </tag-select>
          </a-form-item>
        </standard-form-row>

        <standard-form-row title="其它选项" grid last>
          <a-row>
            <a-col :lg="8" :md="10" :sm="10" :xs="24">
              <a-form-item :wrapper-col="{ sm: { span: 16 }, xs: { span: 24 } }" label="作者">
                <a-select style="max-width: 200px; width: 100%;"
                          mode="multiple"
                          placeholder="不限"
                          v-decorator="['author']"
                          @change="handleChange">
                  <a-select-option value="lisa">王昭君</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :lg="8" :md="10" :sm="10" :xs="24">
              <a-form-item :wrapper-col="{ sm: { span: 16 }, xs: { span: 24 } }" label="好评度">
                <a-select style="max-width: 200px; width: 100%;"
                          placeholder="不限"
                          v-decorator="['rate']">
                  <a-select-option value="good">优秀</a-select-option>
                  <a-select-option value="normal">普通</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
        </standard-form-row>
      </a-form>
    </a-card>

    <div class="ant-pro-pages-list-applications-filterCardList">
      <a-list :loading="loading"
              :data-source="data"
              :grid="{ gutter: 24, xl: 4, lg: 3, md: 3, sm: 2, xs: 1 }"
              style="margin-top: 24px;">
        <a-list-item slot="renderItem" slot-scope="item">
          <a-card :body-style="{ paddingBottom: 20 }" hoverable>
            <a-card-meta :title="item.title">
              <template slot="avatar">
                <a-avatar size="small" :src="item.avatar"/>
              </template>
            </a-card-meta>
            <template slot="actions">
              <a-tooltip title="下载">
                <a-icon type="download"/>
              </a-tooltip>
              <a-tooltip title="编辑">
                <a-icon type="edit"/>
              </a-tooltip>
              <a-tooltip title="分享">
                <a-icon type="share-alt"/>
              </a-tooltip>
              <a-dropdown>
                <a class="ant-dropdown-link">
                  <a-icon type="ellipsis"/>
                </a>
                <a-menu slot="overlay">
                  <a-menu-item>
                    <a href="javascript:;">1st menu item</a>
                  </a-menu-item>
                  <a-menu-item>
                    <a href="javascript:;">2nd menu item</a>
                  </a-menu-item>
                  <a-menu-item>
                    <a href="javascript:;">3rd menu item</a>
                  </a-menu-item>
                </a-menu>
              </a-dropdown>
            </template>
            <div class="">
              <card-info active-user="100" new-user="999"></card-info>
            </div>
          </a-card>
        </a-list-item>
      </a-list>
    </div>
  </page-view>
</template>

<script>
  import { PageView } from '@/layouts'
  import { TagSelect, StandardFormRow, Ellipsis, AvatarList } from '@/components'
  import CardInfo from '../list/search/components/CardInfo'
  import moment from 'moment'

  const TagSelectOption = TagSelect.Option
  const AvatarListItem = AvatarList.AvatarItem

  export default {
    name: 'Stores',
    components: {
      PageView,
      AvatarList,
      AvatarListItem,
      Ellipsis,
      TagSelect,
      TagSelectOption,
      StandardFormRow,
      CardInfo
    },
    data() {
      return {
        categorys: [
          { code: '1', value: '类目1' },
          { code: '2', value: '类目2' },
          { code: '3', value: '类目3' },
          { code: '4', value: '类目4' }
        ],
        data: [],
        form: this.$form.createForm(this),
        loading: true
      }
    },
    filters: {
      fromNow(date) {
        return moment(date).fromNow()
      }
    },
    mounted() {
      this.getList()
    },
    methods: {
      handleChange(value) {
        console.log(`selected ${value}`)
      },
      getList() {
        this.$http.get('/list/article', { params: { count: 8 } }).then(res => {
          console.log('res', res)
          this.data = res.result
          this.loading = false
        })
      }
    }
  }
</script>

<style scoped lang="less">
  .ant-pro-components-tag-select {
    /deep/ .ant-pro-tag-select .ant-tag {
      margin-right: 24px;
      padding: 0 8px;
      font-size: 14px;
    }
  }

  .ant-pro-pages-list-projects-cardList {
    margin-top: 24px;

    /deep/ .ant-card-meta-title {
      margin-bottom: 4px;
    }

    /deep/ .ant-card-meta-description {
      height: 44px;
      overflow: hidden;
      line-height: 22px;
    }

    .cardItemContent {
      display: flex;
      height: 20px;
      margin-top: 16px;
      margin-bottom: -4px;
      line-height: 20px;

      > span {
        flex: 1 1;
        color: rgba(0, 0, 0, .45);
        font-size: 12px;
      }

      /deep/ .ant-pro-avatar-list {
        flex: 0 1 auto;
      }
    }
  }
</style>
