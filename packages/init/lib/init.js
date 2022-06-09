const { Package, log } = require('@hey-cli/utils')

console.log('this is init')

function init(options) {
  const { packageName, targetPath, force } = options
  console.log('初始化参数', options)

  // new Package({
  //   targetPath,
  //   packageName,
  // })
}

module.exports = init
