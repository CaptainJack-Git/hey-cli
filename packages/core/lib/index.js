const pkg = require('../package.json')

function core(argvs) {
  console.log('执行入口', argvs)
  checkPkgVersion()
}

function checkPkgVersion() {
  console.log(pkg.version)
}

module.exports = core
