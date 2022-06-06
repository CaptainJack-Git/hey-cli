const axios = require('axios')
const semver = require('semver')

// npm 源信息
function getNpmRegistry(isOriginal = true) {
  return isOriginal ? 'https://registry.npmjs.org' : 'https://registry.npmmirror.org'
}

// 从 registry 获取 npm 的信息, 调用 npm API，获取远端 npm 所有版本号
async function getNpmInfo(npmName, registry) {
  const register = registry || getNpmRegistry()
  const urlJoin = (await import('url-join')).default
  // https://registry.npmjs.org/@hey-cli/core
  const url = urlJoin(register, npmName)

  return axios.get(url).then(function (response) {
    try {
      if (response.status === 200) {
        return response.data
      }
    } catch (error) {
      return Promise.reject(error)
    }
  })
}

// 获取某个 npm 的最新版本号
function getLatestVersion(npmName, registry) {
  return getNpmInfo(npmName, registry).then(function (data) {
    if (!data['dist-tags'] || !data['dist-tags'].latest) {
      return Promise.reject(new Error('Error: 没有 latest 版本号'))
    }
    const latestVersion = data['dist-tags'].latest
    return latestVersion
  })
}

// 获取某个 npm 的所有版本号
function getNpmVersions(npmName, registry) {
  return getNpmInfo(npmName, registry).then(function (body) {
    const versions = Object.keys(body.versions)
    return versions
  })
}

// 根据指定 version 获取符合 semver 规范的最新版本号
function getLatestSemverVersion(baseVersion, versions) {
  versions = versions
    // 将满足条件的版本号过滤出来，比如当前版本是 1.0.0，那么只有大于 1.0.0 的版本才会满足
    .filter(version => semver.gt(version, baseVersion))
    .sort((a, b) => semver.gt(b, a))
  // 将满足条件的最新的版本号返回
  return versions[0]
}

// 根据指定 version 和包名获取符合 semver 规范的最新版本号
function getNpmLatestSemverVersion(npmName, baseVersion, registry) {
  return getNpmVersions(npmName, registry).then(function (versions) {
    return getLatestSemverVersion(baseVersion, versions)
  })
}

module.exports = {
  getNpmRegistry,
  getNpmInfo,
  getLatestVersion,
  getNpmLatestSemverVersion,
}
