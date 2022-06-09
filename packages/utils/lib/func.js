const path = require('path')

function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

function formatPath(p) {
  if (p && typeof p === 'string') {
    // 分隔符，mac上是/，windows上是\
    const sep = path.sep
    // 如果返回 / 则为 macOS
    if (sep === '/') {
      return p
    } else {
      return p.replace(/\\/g, '/')
    }
  }
  return p
}

module.exports = {
  isObject,
  formatPath,
}
