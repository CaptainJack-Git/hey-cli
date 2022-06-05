const semver = require('semver')
const colors = require('colors')
const path = require('path')

const pkg = require('../package.json')
const { LOWEST_NODE_VERSION, DEFAULT_CLI_HOME } = require('../lib/constants')
const { log } = require('@hey-cli/utils')

let userHome
let config

function core() {
  console.log('执行入口')
  checkArgvs()

  try {
    checkPkgVersion()
    checkNodeVersion()
  } catch (err) {
    log.error(err.message)
  }

  checkRoot()

  checkUserHome()
  checkEnv()
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

// 判断用户主目录
function checkUserHome() {
  userHome = require('userhome')()
  ;(async () => {
    const { pathExists } = await import('path-exists')
    if (!userHome || !pathExists(userHome)) {
      throw new Error(colors.red(`用户主目录不存在，请检查`))
    }
  })()
}

// 检查入参
function checkArgvs() {
  const argvs = require('minimist')(process.argv.slice(2))

  if (argvs.debug) {
    process.env.LOG_LEVEL = 'verbose'
  }

  log.level = process.env.LOG_LEVEL || 'info'
  log.verbose('开启调试测试')
}

// 检查环境变量
function checkEnv() {
  const dotenv = require('dotenv')
  // 这个是在全局主目录的环境变量文件
  const envPath = path.join(userHome, '.env')

  ;(async () => {
    const { pathExists } = await import('path-exists')
    if (pathExists(envPath)) {
      dotenv.config({ path: envPath })
    }
  })()

  createDefaultConfig()
  log.verbose('环境变量', process.env.CLI_HOME_PATH)
}

// 默认配置
function createDefaultConfig() {
  const cliConfig = {
    home: userHome,
  }

  if (process.env.CLI_HOME) {
    cliConfig.cliHome = path.join(userHome, process.env.CLI_HOME)
  } else {
    cliConfig.cliHome = path.join(userHome, DEFAULT_CLI_HOME)
  }

  process.env.CLI_HOME_PATH = cliConfig.cliHome

  return cliConfig
}

module.exports = core
