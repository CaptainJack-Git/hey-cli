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

  checkRoot()
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

// 检查当前账户是否是root账户
function checkRoot() {
  // 当 process.geteuid() 为0时，说明使用的是root用户. ps:不同的平台的普通用户的pid不一样
  log.info(process.geteuid())
  // 以下方法可以对root用户做降级
  // require()不支持 ES6 模块的一个原因是，它是同步加载，而 ES6 模块内部可以使用顶层await命令，导致无法被同步加载。
  ;(async () => {
    await import('root-check')
    log.info(process.geteuid())
  })()
}

module.exports = core
