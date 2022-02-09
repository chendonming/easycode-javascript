'use strict'

import { app, protocol, BrowserWindow, Menu } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import api from './api'

// import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
// eslint-disable-next-line no-unused-vars
let win

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      secure: true,
      standard: true
    }
  }
])

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1320,
    height: 730,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      webSecurity: false
    },
    show: false,
    frame: false
  })

  //= ==========自定义file:///协议的解析=======================
  protocol.interceptFileProtocol('file', (req, callback) => {
    const url = req.url.substr(8)
    callback(decodeURI(url))
  }, (error) => {
    if (error) {
      console.error('Failed to register protocol')
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  win.on('closed', () => {
    win = null
  })

  win.on('ready-to-show', () => {
    win.show()
  })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // try {
    //   await installExtension(VUEJS_DEVTOOLS)
    // } catch (e) {
    //   console.error('Vue Devtools failed to install:', e.toString())
    // }
  }
  const template = [
    {
      label: '&Connection',
      submenu: [
        {
          label: '连接数据库',
          accelerator: 'ctrl+n',
          click () {
            win.webContents.send('connection')
          }
        },
        {
          label: '&Settings',
          accelerator: 'ctrl+alt+s',
          click () {
            win.webContents.send('settings')
          }
        }
      ]
    },
    {
      label: '&Authority',
      submenu: [
        {
          label: '创建账号',
          click () {
            win.webContents.send('openPermissions')
          }
        },
        {
          label: '创建便签',
          click () {
            let newWin = new BrowserWindow({
              webPreferences: {
                // Use pluginOptions.nodeIntegration, leave this alone
                // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
                nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION
              },
              width: 200,
              height: 300,
              frame: false,
              x: 1600,
              y: 100
            })

            if (process.env.WEBPACK_DEV_SERVER_URL) {
              // Load the url of the dev server if in development mode
              newWin.loadURL(process.env.WEBPACK_DEV_SERVER_URL + '#/Note')
            } else {
              createProtocol('app')
              // Load the index.html when not in development
              newWin.loadURL('app://./index.html/#/Note')
            }

            newWin.on('closed', () => {
              newWin = null
            })

            newWin.on('ready-to-show', () => {
              newWin.show()
            })
          }
        }
      ]
    },
    {
      label: '&Window',
      submenu: [{ role: 'minimize' }, { role: 'zoom' }, { role: 'close' }]
    },
    {
      label: '&File',
      submenu: [{ role: 'quit' }]
    },
    {
      label: '&About',
      submenu: [
        {
          label: '前端CRUD',
          submenu: [
            {
              label: '使用手册',
              click () {
                win.webContents.send('about', {
                  id: 'frontCRUD.md',
                  title: '前端CRUD手册'
                })
              }
            }
          ]
        },
        {
          role: 'about'
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  createWindow()
  api(win, win.webContents)
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
