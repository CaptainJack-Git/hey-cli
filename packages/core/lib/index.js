const semver = require('semver')
const colors = require('colors')

const pkg = require('../package.json')
const { LOWEST_NODE_VERSION } = require('../lib/constants')
const { log } = require('@hey-cli/utils')

function core(argvs) {
  console.log('执行入口', argvs)
  try {
    checkPkgVersion()
    checkNodeVersion()
  } catch (err) {
    log.error(err.message)
  }
}

function checkPkgVersion() {
  console.log(pkg.version)
}

// 设置最低版本号，对比用户node版本是否可以运行
function checkNodeVersion() {
  const currentVersion = process.version
  if (!semver.gte(currentVersion, LOWEST_NODE_VERSION)) {
    throw new Error(colors.red(`hey-cli 需要最低的 node 版本为 ${LOWEST_NODE_VERSION}`))
  }
}

module.exports = core
