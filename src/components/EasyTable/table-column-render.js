// import Vue from 'vue'
export default {
  functional: true,
  props: {
    row: Object,
    render: [Function, String],
    index: [Number],
    column: {
      type: Object,
      default() {
        return {}
      }
    }
  },

  render(h, content) {
    const r = content.props.render
    const row = content.props.row
    const index = content.props.index
    const type = typeof r

    if (type === 'function') {
      return r({ h, row, index })
    }
    // else if (type === 'string') {
    //   const prop = content.props.column.prop;
    //   let format = 'YYYY-MM-DD';
    //   let fieldType = r;
    //   if (r.includes('|')) {
    //     const arr = r.split('|');
    //     fieldType = arr[0];
    //     arr[1] && (format = arr[1]);
    //   }
    //   // 格式化时间
    //   if (fieldType === 'date') {
    //     const formatTime = row[prop]
    //       ? Vue.prototype.$moment(`${row[prop]}`).format(format)
    //       : '';
    //     return <span>{formatTime}</span>;
    //   }
    //   return '';
    // }
  }
}
