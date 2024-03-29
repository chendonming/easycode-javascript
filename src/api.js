import { app, dialog, ipcMain } from 'electron'
import fs from 'fs'
import mysql from 'mysql2'
import ejs from 'ejs'
import { v4 as uuidv4 } from 'uuid'
import { exec } from 'child_process'
import localstorage from './localstorage'
import path from 'path'
import fsExtra from 'fs-extra'

function queryAllTables (connection, db) {
  return new Promise((resolve, reject) => {
    const json = {}
    if (connection) {
      connection.query(`use \`${db}\``, err => {
        if (err) {
          json.code = -1
          json.msg = '查询数据库失败: ' + err.message
          reject(json)
        } else {
          connection.query('select TABLE_NAME,TABLE_COMMENT from information_schema.tables where TABLE_TYPE = \'BASE TABLE\'', (err, res) => {
            if (err) {
              json.code = -1
              json.msg = '查询数据库失败: ' + err.message
              reject(json)
            } else {
              json.code = 200
              json.data = res
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

/**
 * 根据表名查询字段名称
 * @param connection
 * @param table
 */
function queryColumns (connection, table) {
  return new Promise((resolve, reject) => {
    const json = {}
    connection.query(`show full columns from \`${table}\``, (err, res) => {
      if (err) {
        json.code = -1
        json.msg = 'err: ' + err.message
        reject(json)
      } else {
        resolve(res)
      }
    })
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
        fs.readdir(path, (err, fileList) => {
          if (err) {
            renderer.send('queryTemplateFile', {
              code: -1,
              msg: '读取文件失败!'
            })
          } else {
            renderer.send('queryTemplateFile', {
              code: 200,
              data: fileList.map(v => ({
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
    const file = path.join(__dirname, '../static/componentList.json')
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
  function generateEjsFile (data, tableName) {
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
        fs.writeFile(fileName, str, { flag: 'a' }, (err) => {
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
      generateEjsFile(data)
    } else {
      queryAllTables(connection, data.database).then(res => {
        if (res.code === 200) {
          res.data.forEach(v => {
            generateEjsFile(data, v.toLocaleUpperCase())
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
      filepath = setting.fileGenerationDirectory + '\\' + name
    } else {
      filepath = app.getPath('userData') + '\\' + name
    }
    ejs.renderFile(data.templateName, {
      ...data,
      _: require('lodash')
    }, (err, str) => {
      if (err) {
        renderer.send('generateCustomFiles', {
          code: -1,
          msg: 'err: ' + err.message,
          err: err
        })
      } else {
        if (data.type === 'previewCode') {
          // 执行预览
          renderer.send('generateCustomFiles', {
            code: 200,
            data: str,
            type: 'previewCode'
          })
        } else {
          fs.writeFile(filepath + '.' + data.suffix, str, { flag: 'ax' }, (err) => {
            if (err) {
              renderer.send('generateCustomFiles', {
                code: err.code,
                err: err
              })
            } else {
              renderer.send('generateCustomFiles', {
                code: 200,
                data: filepath + '.' + data.suffix
              })
            }
          })
        }
      }
    })
  })

  // 显示表中所有字段
  ipcMain.on('displayField', (e, db, table) => {
    const json = {}
    if (connection) {
      connection.query(`use \`${db}\``, async (err) => {
        if (err) {
          json.code = -1
          json.msg = 'err: ' + err.message
          renderer.send('displayField', json)
        } else {
          if (Object.prototype.toString.call(table) === '[object Array]') {
            const jsonArray = []
            for (let i = 0; i < table.length; i++) {
              try {
                const columns = await queryColumns(connection, table[i])
                jsonArray.push(...columns)
              } catch (e) {
                renderer.send('displayField', e)
                break
              }
            }
            renderer.send('displayField', {
              code: 200,
              data: jsonArray
            })
          } else {
            try {
              const tables = await queryColumns(connection, table)
              renderer.send('displayField', {
                code: 200,
                data: tables
              })
            } catch (e) {
              renderer.send('displayField', e)
            }
          }
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

  // 打开文件选择框
  ipcMain.on('openFile', (e, data) => {
    const json = dialog.showOpenDialog({
      title: data.title,
      filters: data.filters,
      properties: ['openFile'],
      message: '输入框的信息测试'
    })

    json.then(res => {
      renderer.send('openFile', res.filePaths)
    })
  })

  // 保存系统设置
  ipcMain.on('saveSetting', (e, json) => {
    localstorage.setItem('setting', json)
    renderer.send('saveSetting', { code: 200 })
  })

  ipcMain.on('getSetting', () => {
    renderer.send('getSetting', localstorage.getItem('setting'))
  })

  ipcMain.on('getKeyValue', () => {
    renderer.send('getKeyValue', {
      code: 200,
      data: localstorage.getItem('keyValue')
    })
  })

  ipcMain.on('saveKeyValue', (e, json) => {
    localstorage.setItem('keyValue', json)
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
  ipcMain.on('consultYourDocumentation', (e, id, filePath) => {
    const file = path.join(__dirname, filePath || '../static/document', id)
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

  // 模板管理 - 新增
  ipcMain.on('TemplateManagementAdd', (e, data) => {
    const uuid = uuidv4()
    const picture = path.join(__dirname, '../static/picture', `${uuid}${path.extname(data.picture)}`)
    const ejs = path.join(__dirname, '../static/ejs', `${uuid}.ejs`)
    // 进行复制操作
    Promise.all([fsExtra.copy(data.picture, picture), fsExtra.copy(data.ejs, ejs)]).then(() => {
      let templates = localstorage.getItem('templates')
      if (!templates) {
        localstorage.setItem('templates', [])
        templates = []
      }

      templates.push({
        id: uuid,
        name: data.name,
        picture,
        ejs
      })

      localstorage.setItem('templates', templates)
      renderer.send('TemplateManagementAdd:success')
    }).catch(err => {
      renderer.send('TemplateManagementAdd:error', err)
    })
  })

  // 模板管理 - 查询
  ipcMain.on('TemplateManagementQuery', () => {
    renderer.send('TemplateManagementQuery:success', localstorage.getItem('templates'))
  })

  // 模板管理 - 设置当前模板
  ipcMain.on('setCurrentTemp', (e, data) => {
    localstorage.setItem('currentTemp', data)
  })

  // 模板管理 - 获取当前模板
  ipcMain.on('getCurrentTemp', () => {
    renderer.send('getCurrentTemp:success', localstorage.getItem('currentTemp'))
  })

  // 模板管理 - 删除模板
  ipcMain.on('TemplateManagementDel', (e, data) => {
    const temps = localstorage.getItem('templates').filter(v => v.id !== data.id)
    localstorage.setItem('templates', temps)
    renderer.send('TemplateManagementDel:success')
  })

  ipcMain.on('close', () => {
    win.close()
  })
}
