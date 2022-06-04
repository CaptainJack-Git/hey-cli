#!/usr/bin/env node
'use strict'

const importLocal = require('import-local')
const { log } = require('@hey-cli/utils')

if (importLocal(__filename)) {
  log.info('使用本地 node_modules/hey-cli 版本')
} else {
  log.info('开发模式')
  require('./lib/index')(process.argv.slice(2))
}
