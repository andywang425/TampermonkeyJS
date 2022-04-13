const readline = require('readline')
const fs = require('fs')

// 读取当前目录
fs.readdir('./', (error, files) => {
  // 遍历目录
  if (error === null) files.forEach(file => {
    fs.lstat(file, (error, stats) => {
      // 判断是否为特定目录
      if (error === null && stats.isDirectory() && file.match(/^[a-zA-Z]/) !== null) {
        // 根据命名规则读取文件
        const tsFlie = `${file}/${file}.user.ts`
        const jsFlie = `${file}/${file}.user.js`
        fs.lstat(tsFlie, (error, stats) => {
          if (error === null && stats.isFile()) GMheads(tsFlie, jsFlie)
          else {
            // 根据命名规则读取文件
            const tsFlie = `${file}/${file}.ts`
            const jsFlie = `${file}/${file}.js`
            fs.lstat(tsFlie, (error, stats) => {
              if (error === null && stats.isFile()) GMheads(tsFlie, jsFlie)
            })
          }
        })
      }
    })
  })
})
function GMheads(tsFlie, jsFlie) {
  const header = []
  const script = []
  // 写入js
  const writeJS = () => {
    fs.writeFile(jsFlie, header.concat(script).join('\n'), error => {
      if (error === null) console.log(jsFlie, 'ok')
      else console.error(error)
    })
  }
  // 读取js
  const jsRL = readline.createInterface({
    input: fs.createReadStream(jsFlie),
    crlfDelay: Infinity
  })
  jsRL.on('line', line => {
    if (line === '// ==UserScript==') {
      jsRL.removeAllListeners()
      jsRL.close()
      console.log(jsFlie, 'ignore')
    }
    if (!line.startsWith('import') && !line.startsWith('export'))
      script.push(line.replace(/^((?:  )+)\1/, '$1'))
  })
  jsRL.on('close', () => {
    // 读取ts
    const tsRL = readline.createInterface({
      input: fs.createReadStream(tsFlie),
      crlfDelay: Infinity
    })
    tsRL.on('line', line => {
      header.push(line)
      if (line === '// ==/UserScript==') {
        tsRL.removeAllListeners()
        tsRL.close()
        writeJS()
      }
    })
  })
}