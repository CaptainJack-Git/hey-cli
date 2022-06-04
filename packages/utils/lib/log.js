// 对npmlog进行封装改造
const log = require('npmlog')

log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info'

// 自定义头部
log.heading = 'hey'
log.headingStyle = { fg: 'magenta', bg: 'white' }

log.addLevel('success', 2000, { fg: 'green', bold: true })
log.addLevel('notice', 2000, { fg: 'blue', bold: 'black' })

module.exports = log
