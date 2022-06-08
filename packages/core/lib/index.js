const semver = require('semver')
const colors = require('colors')
const path = require('path')
const commander = require('commander')

const pkg = require('../package.json')
const { LOWEST_NODE_VERSION, DEFAULT_CLI_HOME } = require('../lib/constants')
const { init } = require('@hey-cli/commands')
const { log, npm } = require('@hey-cli/utils')

let userHome

async function prepare() {
  checkRoot()
  checkNodeVersion()
  checkUserHome()
  checkEnv()
  await checkGlobalUpdate()
}

async function core() {
  try {
    await prepare()
    registerCommand()
  } catch (err) {
    log.error(err.message)
  }
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

//
/**
 * 检查脚手架版本是否需要更新
 * 1、获取当前版本号和模块名
 * 2、调用 npm API，获取远端 npm 所有版本号
 * 3、提取所有版本号，比对哪些版本号是大于当前版本号
 * 4、获取最新的版本号，提示用户更新版本
 */
async function checkGlobalUpdate() {
  // 获取当前版本号和模块名
  const currentVersion = pkg.version
  const npmName = pkg.name

  const latestVersion = await npm.getNpmLatestSemverVersion(npmName, currentVersion)

  if (latestVersion && semver.gt(latestVersion, currentVersion)) {
    log.warn(`hey-cli 有新版本! 当前版本为 ${currentVersion}, 最新版本为 ${latestVersion}
    请使用 npm update -g hey-cli 更新`)
  } else {
    log.verbose('hey-cli 已经是最新版本')
  }
}

const program = new commander.Command()

function registerCommand() {
  program
    .version(pkg.version)
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .option('-d, --debug', '是否调试模式', false)

  program
    .command('init [projectName]')
    .option('-f, --force', '是否强制初始化', false)
    // 常用于调试时使用
    .option('-tp, --target-path <targetPath>', '是否指定本地调试目标路径', '')
    .action(init)

  // debug模式监测
  program.on('option:debug', () => {
    if (program.opts().debug) {
      process.env.LOG_LEVEL = 'verbose'
    } else {
      process.env.LOG_LEVEL = 'info'
    }

    log.level = process.env.LOG_LEVEL
    if (program.opts().debug) {
      log.verbose('开启调试测试')
    }
  })

  // 未知不可用命令的提示
  program.on('command:*', obj => {
    const availableCommands = Object.keys(program.commands.map(cmd => cmd.name()))
    console.log(availableCommands)
    console.log(colors.red('未知命令: ', obj[0]))
    console.log(colors.red('可用命令: ', availableCommands.join('| ')))
  })

  // 当没有命令输入、或者只有参数，如 -d 输入的时候，也显示帮助信息，比如只输入一个 hey，或者 hey -d
  if (program.args.length < 1) {
    program.outputHelp()
  }
  // 对命令正常解析
  program.parse(process.argv)
}

module.exports = core
