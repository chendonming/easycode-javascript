'use strict'

/**
 * 读取本地配置
 */
const fs = require('fs')
const path = require('path')
/**
 * 判断配置文件是否存在
 */
function isExit () {
  let success = true
  if (!(localConfig.config && typeof localConfig.config === 'object')) {
    success = initConfig()
  }
  return success
}
/**
 * 初始化config
 */
function initConfig () {
  try {
    const config = readConfig()
    if (config) {
      localConfig.config = JSON.parse(config)
      return true
    }
    const defaultConfig = {}
    const content = JSON.stringify(defaultConfig)
    fs.writeFileSync(localConfig.configUrl, content)
    localConfig.config = defaultConfig
    return true
  } catch (e) {
    return false
  }
}
/**
 * 读取文件
 */
function readConfig () {
  try {
    return fs.readFileSync(localConfig.configUrl)
  } catch (error) {
    return false
  }
}
/**
 * 写入文件
 */
function writeConfig (value) {
  try {
    const content = JSON.stringify(value)
    fs.writeFileSync(localConfig.configUrl, content)
    return true
  } catch (e) {
    return false
  }
}

const localConfig = {
  config: null,
  configUrl: path.join(__dirname, '../static/localConfig.json'),
  setStoragePath: (path) => {
    localConfig.configUrl = path
  },
  getStoragePath: () => {
    return localConfig.configUrl
  },
  getItem: (key) => {
    const success = isExit()
    if (success) {
      const result = localConfig.config[key]
      return result || ''
    }
    return null
  },
  setItem: (key, value) => {
    const success = isExit()
    if (success) {
      const config = Object.assign({}, localConfig.config)
      config[key] = value
      const suc = writeConfig(config)
      if (suc) {
        localConfig.config = config
        return true
      }
    }
    return false
  },
  getAll: () => {
    const success = isExit()
    if (success) {
      return localConfig.config
    }
    return null
  },
  removeItem: (key) => {
    const value = localConfig.getItem(key)
    if (value) {
      const config = Object.assign({}, localConfig.config)
      delete config[key]
      const suc = writeConfig(config)
      if (suc) {
        localConfig.config = config
        return true
      }
    }
    return false
  },
  clear: () => {
    const success = isExit()
    if (success) {
      const suc = writeConfig({})
      if (suc) {
        localConfig.config = {}
        return true
      }
    }
    return false
  }
}

module.exports = localConfig
