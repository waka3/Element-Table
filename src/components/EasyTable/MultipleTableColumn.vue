<template>
  <el-table-column v-bind="column" show-overflow-tooltip>
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
    <template slot-scope="scope">
      <div :style="column.align | textAlign">{{ scope.row | handlerEmpty(column) }}</div>
    </template>
    <template v-for="(item, index) in column.children">
      <MultipleTableColumn
        v-if="item.children && item.children.length"
        :key="`_${index}`"
        :column="item"
      />
      <template v-else-if="item.render">
        <el-table-column v-if="item.render" :key="item.prop" show-overflow-tooltip v-bind="item">
          <template slot-scope="scope">
            <table-column-render
              :row="scope.row"
              :render="item.render"
              :column="item"
              :index="scope.$index"
            />
          </template>
        </el-table-column>
      </template>
      <el-table-column v-else :key="`__${index}`" show-overflow-tooltip v-bind="item" />
    </template>
  </el-table-column>
</template>
<script>
import TableColumnRender from './table-column-render'
export default {
  name: 'MultipleTableColumn',
  components: { TableColumnRender },
  filters: {
    handlerEmpty(row, column) {
      const { formatter } = column
      if (row[column.prop] !== 0 && row[column.prop] !== false && !row[column.prop]) {
        return '-'
      }
      if (typeof formatter === 'function') {
        return formatter(row, column)
      } else {
        return row[column.prop]
      }
    },
    textAlign(val) {
      const position = val || 'left'
      return `text-align: ${position}`
    }
  },
  props: {
    column: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      currentValue: {}
    }
  }
}
</script>
