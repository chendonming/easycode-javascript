module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        appId: 'com.chendm.easycode-javascript.1.0.0',
        productName: 'EasyCode',
        copyright: 'Copyright © 2020',
        directories: {
          output: './dist'
        },
        extraResources: ['./static/**'],
        buildVersion: '1.0.0',
        nsis: {
          createDesktopShortcut: true,
          createStartMenuShortcut: true
        },
        win: {
          icon: 'favicon.ico',
          target: [
            {
              target: 'nsis',
              arch: [
                'x64',
                'ia32'
              ]
            }
          ]
        }
      }
    }
  }
}
