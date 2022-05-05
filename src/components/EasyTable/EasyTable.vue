<!--
 * @description: 简易表格封装
 -->
<template>
  <div class="table">
    <div class="export-excel">
      <slot name="button" />
      <el-button
        v-if="exportExcel"
        type="primary"
        size="small"
        icon="el-icon-upload2"
        @click="handleDownload"
      >导出Excel</el-button>
    </div>
    <div v-loading="loading" element-loading-text="数据加载中..." class="table-wrap">
      <slot name="thead" />
      <el-table
        ref="tables"
        :data="innerData"
        v-bind="$attrs"
        :height="height"
        :span-method="spanMethod"
        :header-cell-style="getRowClass"
        :row-class-name="tableRowClassName"
        :page-sizes="pageSize"
        :page-size="pageSize"
        style="width: 100%;margin-top: 8px;text-align:center;"
        v-on="$listeners"
        @selection-change="handlerSelectionChange"
      >
        <el-table-column v-if="!hideCheckox" type="selection" :reserve-selection="reserveSelection" />
        <el-table-column
          v-if="showIndex"
          type="index"
          label="序号"
          fixed
          align="center"
          width="60"
          :index="indexMethod"
        />
        <template v-for="(column, index) in columns">
          <el-table-column
            v-if="column.render"
            :key="`${column.prop}_${index}`"
            align="center"
            v-bind="column"
          >
            <template slot-scope="scope">
              <RenderColumn
                :row="scope.row"
                :render="column.render"
                :column="column"
                :index="scope.$index"
              />
            </template>
            <!-- 自定义表头 -->
            <template slot="header">
              <el-tooltip v-if="column.tips" effect="dark" :content="column.tips" placement="top">
                <span>
                  <span>{{ column.label }}</span>
                  <i class="el-icon-question" />
                </span>
              </el-tooltip>
              <span v-else>{{ column.label }}</span>
            </template>
            <!--  -->
          </el-table-column>
          <MultipleTableColumn v-else :key="`${column.prop}_${index}`" :column="column" />
        </template>
      </el-table>
      <EasyTableFooter v-if="isEasyFooter" ref="easyTableFooter" :data="footerInnerData" />
      <slot name="tableFooter" />
      <Pagination
        v-if="!hidePagination"
        ref="pagination"
        :auto-scroll="false"
        :total="total"
        :limit="pgSize"
        :page-sizes="pageSizes"
        v-bind="$attrs.paginationProp"
        @pagination="handlePaginationChange"
      />
      <template v-if="innerData.length < 1">
        <div v-if="this.$slots.noDataTips" class="noData">
          <slot name="noDataTips" />
        </div>
      </template>
    </div>
  </div>
</template>
<script>
import RenderColumn from './table-column-render'
import Pagination from './pagination'
import MultipleTableColumn from './MultipleTableColumn'
import { debounce } from './utils'
import EasyTableFooter from './TableFooter/el-table-footer.vue'
export default {
  name: 'EasyTable',
  components: {
    RenderColumn,
    Pagination,
    MultipleTableColumn,
    EasyTableFooter
  },
  props: {
    // 是否立即加载数据
    autoLoad: {
      type: Boolean,
      default: true
    },
    // 是否开启远程数据获取
    fetch: {
      type: Boolean,
      default: false
    },
    // 请求之前处理参数
    beforeFetch: {
      type: Function,
      default: null
    },
    // 请求之后处理列表
    afterFetch: {
      type: Function,
      default: null
    },
    // 某一行添加 class，表明该行处于某种状态
    tableRowClassName: {
      type: Function,
      default: null
    },
    // api
    fetchPromise: {
      type: [Function],
      default: () => {}
    },
    // 参数
    searchInfo: {
      type: Object,
      default: () => {}
    },
    // 显示序号
    showIndex: {
      type: Boolean,
      default: false
    },
    // 数据字段
    listField: {
      type: String,
      default: ''
    },
    itemsField: {
      type: String,
      default: 'list'
    },
    totalField: {
      type: String,
      default: 'total'
    },
    // 是否隐藏勾选框
    hideCheckox: {
      type: Boolean,
      default: true
    },
    // 换页是否保留复选框选中状态
    reserveSelection: {
      type: Boolean,
      default: false
    },
    //  是否隐藏分页
    hidePagination: {
      type: Boolean,
      default: false
    },
    columns: {
      type: Array,
      default: () => []
    },
    data: {
      type: Array,
      default: () => []
    },
    // 每页条数
    pageSize: {
      type: Number,
      default: 10
    },
    height: {
      type: [String, Number],
      default: null
    },
    pageSizes: {
      type: Array,
      default() {
        return [10, 20, 30, 50]
      }
    },
    // 合并列信息
    merge: {
      type: Array,
      default() {
        return []
      }
    },
    // 选中数据
    selectionData: {
      type: Array,
      default: () => []
    },
    // 导出表格的全部数据
    allSelection: {
      type: Array,
      default: () => []
    },
    // 是否显示导出
    exportExcel: {
      type: Boolean,
      default: false
    },
    isEasyFooter: {
      type: Boolean,
      default: false
    },
    footerData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: false,
      currentPage: 1,
      pgSize: this.pageSize,
      innerData: [],
      total: 0,
      mergeLine: {},
      mergeIndex: {},
      allSelect: false,
      selectionChange: [],
      allSelectionData: [],
      footerInnerData: [
        {
          label: '总计',
          data: {}
        }
      ]
    }
  },
  computed: {
    spanMethod() {
      const { merge, mergeMethod, $attrs } = this
      return merge.length !== 0 ? mergeMethod : $attrs['span-method']
    }
  },
  watch: {
    footerData: {
      handler(val) {
        this.footerInnerData = val
      },
      deep: true
    },
    data: {
      handler(v) {
        console.log('数据变化')
        this.innerData = v
      },
      deep: true
    },
    selectionData: {
      handler(v) {
        this.selectionChange = v
      },
      deep: true
    },
    allSelection: {
      handler(v) {
        this.allSelectionData = v
      },
      deep: true
    },
    merge() {
      this.getMergeArr(this.innerData, this.merge)
    },
    total() {
      this.getMergeArr(this.innerData, this.merge)
    },
    $route() {
      // console.log('table $route')
      this.redoLayout()
    }
  },
  mounted() {
    if (this.autoLoad && this.fetch) {
      this.fetchList()
    } else {
      this.innerData = this.data
      this.getMergeArr(this.innerData, this.merge)
    }
    this.__resizeHandler = debounce(() => {
      this.redoLayout()
    }, 100)
    window.addEventListener('resize', this.__resizeHandler)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.__resizeHandler)
  },
  methods: {
    redoLayout() {
      this.$nextTick(() => {
        if (this.$refs && this.$refs.tables) {
          // console.log('this.$refs.tables.doLayout')
          // this.$refs.tables.bodyWrapper.scrollTop = 1;
          // this.$refs.tables.bodyWrapper.scrollLeft = 1;
          this.$refs.tables.doLayout()
        }
      })
    },
    async initEasyFooter() {
      await this.$nextTick()
      const { easyTableFooter, tables } = this.$refs
      // 调用init方法传入表格实例初始化footer
      // console.log(this.$refs.tables);
      if (tables && easyTableFooter) easyTableFooter.init(tables)
    },
    //
    mergeMethod({ column, rowIndex }) {
      const index = this.merge.indexOf(column.property)
      if (index > -1) {
        const rowspan = this.mergeIndex[this.merge[index]][rowIndex]
        const colspan = rowspan > 0 ? 1 : 0
        return { rowspan, colspan }
      }
    },
    getMergeArr(tableData, merge) {
      if (!merge) return
      this.mergeLine = {}
      this.mergeIndex = {}
      merge.forEach((item)=> {
        tableData.forEach((data, i) => {
          if (i === 0) {
            this.mergeIndex[item] = this.mergeIndex[item] || []
            this.mergeIndex[item].push(1)
            this.mergeLine[item] = 0
          } else {
            if (data[item] === tableData[i - 1][item]) {
              this.mergeIndex[item][this.mergeLine[item]] += 1
              this.mergeIndex[item].push(0)
            } else {
              this.mergeIndex[item].push(1)
              this.mergeLine[item] = i
            }
          }
        })
      })
    },
    // 加载表格数据
    async fetchList() {
      this.loading = true
      try {
        let pagination = {}
        if (this.hidePagination) {
          pagination = {}
        } else {
          pagination = {
            pageNo: this.currentPage,
            pageSize: this.pgSize
          }
        }
        // 处理参数
        const hasBefore =
          this.beforeFetch && typeof this.beforeFetch === 'function'
        let parame = Object.assign({}, pagination, this.searchInfo)
        parame = hasBefore ? hasBefore(parame) : parame
        console.log('======================')
        console.log('表格参数:', parame)
        console.log('======================')
        const res = await this.fetchPromise(parame)
        const data = res.body || {}
        this.$emit('success', data)
        if (!data[this.itemsField]) {
          this.innerData = []
          this.total = 0
          return
        }
        const { total = 0, items = [] } = this.getDataList(data) || {
          total: 0,
          items: []
        }
        // 处理返回出具
        const hasAfter =
          this.afterFetch && typeof this.afterFetch === 'function'
        this.innerData = hasAfter ? this.afterFetch(items) : items
        this.total = total
        if (this.isEasyFooter) {
          this.footerInnerData[0].data = data.totaldata
          this.initEasyFooter()
        }
      } catch (error) {
        console.log(error)
      } finally {
        this.loading = false
        if (this.isEasyFooter) {
          this.redoLayout()
        }
      }
    },
    // 刷新整个表格
    reload() {
      this.currentPage = 1
      this.pgSize = this.pageSize
      if (this.innerData.length && !this.hidePagination) {
        this.$refs.pagination.innerPageRefesh()
      }
      this.fetchList()
    },
    // 刷新当前页
    reloadCurrentPage() {
      this.fetchList()
    },
    getRowClass({ rowIndex }) {
      return rowIndex === 0 ? 'background:#F5F7FA' : ''
    },
    handlePaginationChange(data) {
      this.$emit('pagination', data)
      const { page, limit } = data
      this.currentPage = page
      this.pgSize = limit
      this.fetchList()
    },
    getDataList(data) {
      const listField = this.listField
      if (!listField) {
        return {
          items: data[this.itemsField],
          total: data[this.totalField] || 0
        }
      }
      if (!listField.includes('.')) {
        return {
          items: data[listField][this.itemsField],
          total: data[listField][this.totalField] || 0
        }
      } else {
        let res = data
        const fieldArr = listField.split('.')
        /* eslint-disable no-unused-vars */
        let total = 0
        fieldArr.forEach((field, index) => {
          res = res[field]
          if (index === fieldArr.length - 2) {
            total = res['total']
          }
        })
        return {
          items: res[this.itemsField],
          total: res[this.totalField]
        }
      }
    },
    indexMethod(index) {
      return index + 1 + (this.currentPage - 1) * this.pgSize
    },
    toggleSelection(rows) {
      this.$nextTick(() => {
        if (rows) {
          rows.forEach(row => {
            this.$refs.tables.toggleRowSelection(row)
          })
        } else {
          this.$refs.tables.clearSelection()
        }
      })
    },
    clearSelection() {
      this.$refs.tables.clearSelection()
    },
    // 选项改变
    handlerSelectionChange(item) {
      this.$emit('selection-change', item)
    },
    // 全选/反选
    toggleSelect() {
      if (this.innerData) {
        this.innerData.forEach(row => {
          this.$refs.tables.toggleRowSelection(row)
        })
        this.allSelect = !this.allSelect
      }
    },
    // 导出Excel表格按钮
    handleDownload() {
      this.$emit('selectionExcel')
    }
  }
}
</script>
<style>
.table {
  position: relative;
}
.table .el-table__fixed, .table .el-table__fixed-right{
  pointer-events: none;
}
.table .el-table__fixed-body-wrapper{
  pointer-events: none;
}
.table .el-table__row td .el-tooltip div, .table .el-table__row td .el-tooltip span {
  display: inline;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.table .export-excel {
  display: flex;
  justify-content: flex-end;
}
.table-wrap {
  position: relative;
}
.noData {
  position: absolute;
  top: 0;
  z-index: 9;
  width: 100%;
  font-size: 18px;
  font-weight: 300;
  padding: 300px 0;
  background-color: #409EFF;
}
.noData:nth-child(odd), .noData:nth-child(even) {
  text-align: center;
}
</style>
