const { Package, log } = require('@hey-cli/utils')

function init(name, options) {
  const { projectName, targetPath, force } = options
  console.log('初始化参数', options)

  downLoadTpl({ targetPath })
}

async function downLoadTpl({ targetPath }) {
  const templatePkg = new Package({
    targetPath,
  })
}

module.exports = init
