const fs = require('fs')
const path = require('path')

fs.readdir(path.join(__dirname, '../src/components'), (err, files) => {
  if (err) {
    console.log('目录不存在')
    return
  }
  let content = `/*${new Date()}*/`
  let ex = []
  // 处理导出代码
  files.forEach(item => {
    // 读取目录名
    content = content + `import ${item} from '../src/components/${item}';`
    ex.push(item)
  })
  ex = ex.join(",")
  content = content + `export { ${ex} }; `
  console.log(content)

  fs.writeFile(path.join(__dirname, './index.js'), content, 'utf8', (err) => {
    if (err) throw err;
  });
})