import { ipcMain, app, dialog } from 'electron'
import fs from 'fs'
import mysql from 'mysql2'
import ejs from 'ejs'
import { v4 as uuidv4 } from 'uuid'
import { exec } from 'child_process'
import localstorage from './localstorage'
import path from 'path'

function queryAllTables (connection, db) {
  return new Promise((resolve, reject) => {
    const json = {}
    if (connection) {
      connection.query(`use ${db}`, err => {
        if (err) {
          json.code = -1
          json.msg = '查询数据库失败: ' + err.message
          reject(json)
        } else {
          connection.query('show tables', (err, res) => {
            if (err) {
              json.code = -1
              json.msg = '查询数据库失败: ' + err.message
              reject(json)
            } else {
              json.code = 200
              json.data = res.map(v => v[`Tables_in_${db}`])
              resolve(json)
            }
          })
        }
      })
    } else {
      json.code = -1
      json.msg = '请链接数据库再做此操作'
      reject(json)
    }
  })
}

export default function (win, renderer) {
  let connection
  ipcMain.on('queryTemplateFile', () => {
    const path = app.getPath('userData') + '\\template'
    fs.access(path, err => {
      if (err) {
        // 创建文件夹再返回空数据
        fs.mkdir(path, err => {
          const json = {}
          if (err) {
            json.code = -1
            json.msg = '创建文件夹失败'
          } else {
            json.code = 200
            json.data = []
          }
          renderer.send('queryTemplateFile', json)
        })
      } else {
        fs.readdir(path, (err, filelist) => {
          if (err) {
            renderer.send('queryTemplateFile', {
              code: -1,
              msg: '读取文件失败!'
            })
          } else {
            renderer.send('queryTemplateFile', {
              code: 200,
              data: filelist.map(v => ({
                title: v,
                value: path + '\\' + v
              }))
            })
          }
        })
      }
    })
  })

  ipcMain.on('localTemplateFile', () => {
    const folder = path.join(__dirname, '../static/ejs/')
    fs.access(folder, err => {
      if (!err) {
        fs.readdir(folder, (err, fileList) => {
          if (!err) {
            renderer.send('localTemplateFile', fileList.map(v => ({
              title: v,
              value: folder + v
            })))
          }
        })
      }
    })
  })

  ipcMain.on('loadComponentList', () => {
    const file = path.join(__dirname, '../static/componentList.jsonc')
    fs.readFile(file, 'utf8', (err, data) => {
      if (!err) {
        renderer.send('loadComponentList', data)
      }
    })
  })

  ipcMain.on('connectToTheDatabase', (e, data) => {
    try {
      delete data.tryConnection
      if (connection) connection.destroy()
      connection = mysql.createConnection(data)
      connection.ping((err) => {
        if (err) {
          win.webContents.send('connection.failed', { msg: err.message })
        } else {
          win.webContents.send('connection.success')
        }
      })
    } catch (err) {
      win.webContents.send('connection.failed', { msg: err.message })
    }
  })

  ipcMain.on('showDatabase', () => {
    const json = {}
    if (connection) {
      connection.query('show databases', (err, res) => {
        if (err) {
          json.code = -1
          json.msg = '查询数据库失败: ' + err.message
        } else {
          json.code = 200
          json.data = res.map(v => v.Database).filter(v => ['information_schema', 'performance_schema', 'mysql'].indexOf(v) === -1)
        }
        renderer.send('showDatabase', json)
      })
    } else {
      json.code = -1
      json.msg = '请链接数据库再做此操作'
      renderer.send('showDatabase', json)
    }
  })

  ipcMain.on('queryAllTables', async (e, db) => {
    try {
      const data = await queryAllTables(connection, db)
      renderer.send('queryAllTables', data)
    } catch (err) {
      renderer.send('queryAllTables', err)
    }
  })

  // 根据Ejs生成实体类文件 (Test)
  function gennerateEjsFile (data, tableName) {
    const newTableName = data.tableName ? data.tableName.toLocaleUpperCase() : tableName
    const newData = {
      ...data,
      table: newTableName,
      date: new Date().toLocaleDateString(),
      className: 'Test'
    }
    ejs.renderFile(data.templateName, newData, (err, str) => {
      if (err) {
        renderer.send('generateEntityFiles', {
          code: -1,
          msg: 'err: ' + err.message
        })
      } else {
        const fileName = app.getPath('userData') + '\\files\\' + newTableName + '.java'
        fs.writeFile(fileName, str, { flag: 'a' }, (err, datas) => {
          if (err) {
            renderer.send('generateEntityFiles', {
              code: -1,
              msg: 'err: ' + err.message
            })
          } else {
            renderer.send('generateEntityFiles', {
              code: 200,
              data: fileName
            })
          }
        })
      }
    })
  }

  // 生成实体类文件
  ipcMain.on('generateEntityFiles', (e, data) => {
    if (data.tableName) {
      gennerateEjsFile(data)
    } else {
      queryAllTables(connection, data.database).then(res => {
        if (res.code === 200) {
          res.data.forEach(v => {
            gennerateEjsFile(data, v.toLocaleUpperCase())
          })
        }
      })
    }
  })

  ipcMain.on('generateCustomFiles', (e, data) => {
    // 使用固定文件位置
    const setting = localstorage.getItem('setting')
    const name = data.name || uuidv4()
    let filepath
    if (setting && setting.fileGenerationDirectory) {
      filepath = setting.fileGenerationDirectory + '\\' + name + '.' + data.suffix
    } else {
      filepath = app.getPath('userData') + '\\' + name + '.' + data.suffix
    }
    ejs.renderFile(data.templateName, { ...data, _: require('lodash') }, (err, str) => {
      if (err) {
        renderer.send('generateEntityFiles', {
          code: -1,
          msg: 'err: ' + err.message
        })
      } else {
        // flag: a 不存在该文件则会创建该文件
        fs.writeFile(filepath, str, { flag: 'ax' }, (err, datas) => {
          if (err) {
            renderer.send('generateCustomFiles', {
              code: err.code
            })
          } else {
            renderer.send('generateCustomFiles', {
              code: 200,
              data: filepath
            })
          }
        })
      }
    })
  })

  // 显示表中所有字段
  ipcMain.on('displayField', (e, db, table) => {
    const json = {}
    if (connection) {
      connection.query(`use ${db}`, (err, res) => {
        if (err) {
          json.code = -1
          json.msg = 'err: ' + err.message
          renderer.send('displayField', json)
        } else {
          connection.query(`show full columns from ${table}`, (err, res) => {
            if (err) {
              json.code = -1
              json.msg = 'err: ' + err.message
              renderer.send('displayField', json)
            } else {
              json.code = 200
              json.data = res
              renderer.send('displayField', json)
            }
          })
        }
      })
    } else {
      json.code = -1
      json.msg = '请链接数据库再做此操作'
      renderer.send('displayField', json)
    }
  })

  // 调用vscode
  ipcMain.on('transferCode', (e, data) => {
    exec(`code ${data}`)
  })

  // 调用资源管理器
  ipcMain.on('transferExplorer', (e, data) => {
    exec(`explorer /select,${data}`)
  })

  // 打开文件夹选择框
  ipcMain.on('openDirectory', (e, data) => {
    const json = dialog.showOpenDialog({
      title: data.title,
      properties: ['openDirectory'],
      message: '输入框的信息测试'
    })

    json.then(res => {
      renderer.send('openDirectory', res.filePaths)
    })
  })

  ipcMain.on('saveSetting', (e, json) => {
    localstorage.setItem('setting', json)
    renderer.send('saveSetting', { code: 200 })
  })

  ipcMain.on('getSetting', () => {
    renderer.send('getSetting', localstorage.getItem('setting'))
  })

  // 保存数据源
  ipcMain.on('saveDataSource', (e, json) => {
    localstorage.setItem('dataSource', json)
  })

  // 取出数据源
  ipcMain.on('getDataSource', () => {
    renderer.send('getDataSource', localstorage.getItem('dataSource'))
  })

  // 查询文档
  ipcMain.on('consultYourDocumentation', (e, id) => {
    const file = path.join(__dirname, '../static/document', id)
    fs.access(file, err => {
      if (!err) {
        fs.readFile(file, 'utf8', (err, data) => {
          if (!err) {
            renderer.send('consultYourDocumentation', data)
          }
        })
      }
    })
  })

  ipcMain.on('close', () => {
    win.close()
  })
}
