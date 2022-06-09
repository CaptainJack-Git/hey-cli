const npminstall = require('npminstall')
const path = require('path')
const fs = require('fs')
const fse = require('fs-extra')

const npm = require('./npm')
const log = require('./log')
const { isObject, formatPath } = require('./func')

class Package {
  constructor(options) {
    if (!isObject(options)) {
      throw new Error(`options 必须是一个对象`)
    }

    console.log('Package options', options)

    // package安装到的路径
    this.targetPath = options.targetPath
    // package的缓存本地路径
    this.storeDir = options.storeDir

    this.packageName = options.packageName

    this.packageVersion = options.packageVersion

    // package 的缓存目录前缀 @hey-cli/utils -> @hey-cli_utils
    this.cacheFilePathPrefix = this.packageName.replace('/', '_')
  }

  // 缓存文件路径 路径格式 _@hey-cli_utils@0.0.2-alpha.0@@hey-cli
  get cacheFilePath() {
    return path.resolve(
      this.storeDir,
      `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`
    )
  }

  async prepare() {
    // if (!fs.existsSync(this.targetPath)) {
    //   fse.mkdirpSync(this.targetPath)
    // }

    // if (!fs.existsSync(this.storeDir)) {
    //   fse.mkdirpSync(this.storeDir)
    // }

    log.verbose(`package ${this.packageName} 安装到 ${this.targetPath}`, this.storeDir)

    // 此种情况，将 latest 转化为具体的版本号
    if (this.packageVersion === 'latest') {
      this.packageVersion = await npm.getLatestVersion(this.packageName)
    }

    log.verbose('latestVersion', this.packageName, this.packageVersion)
  }

  // 判断当前 package 是否已经安装
  async exists() {
    let result
    const { pathExists } = await import('path-exists')

    // storeDir 存在时为缓存模式
    if (this.storeDir) {
      await this.prepare()
      console.log('缓存路径', this.cacheFilePath)
      result = await pathExists(this.cacheFilePath)
    } else {
      result = await pathExists(this.targetPath)
    }
    return result
  }

  // 具体的模块下载安装
  async install() {
    await this.prepare()

    // Promise...
    return npminstall({
      root: this.targetPath, // 模块所在路径
      storeDir: this.storeDir, // 存储到的路径 dir/node_modules
      registry: npm.getNpmRegistry(),
      pkgs: [{ name: this.packageName, version: this.packageVersion }],
    })
  }

  // 更新package
  update() {}

  // 读取package.json的内容
  getPackage(isOriginal = false) {
    if (isOriginal) {
      return fse.readJsonSync(path.resolve(this.storeDir, 'package.json'))
    }

    return fse.readJsonSync(path.resolve(this.npmFilePath, 'package.json'))
  }

  /**
   * 获取入口文件路径, package.json 中对应的 main 字段
   * 1、获取package.json所在目录 - pkg-dir
   * 2、读取package.json
   * 3、找到 package.json 中的 main 字段，代表path
   * 4、对3找到的路径做兼容(macOS/windows)
   */
  async getRootFilePath() {
    const { packageDirectory } = await import('pkg-dir')
    let _filePath = this.cacheFilePath || this.targetPath

    const dir = await packageDirectory({ cwd: _filePath })

    log.verbose('项目文件夹', dir)

    if (dir) {
      const pkgFile = require(path.resolve(dir, 'package.json'))

      if (pkgFile && pkgFile.main) {
        return formatPath(path.resolve(dir, pkgFile.main))
      }
    }
  }
}

module.exports = Package
