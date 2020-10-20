module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        appId: 'com.chendm.easycode-javascript',
        productName: 'EasyCode',
        copyright: 'Copyright © 2020',
        directories: {
          output: './dist'
        },
        win: {
          icon: '',
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
