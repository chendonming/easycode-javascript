<template>
  <div class="Generate">
    <pre v-show="errorShow">
      {{ errorMessage }}
    </pre>
    <div class="right">
      <div>
        <el-button type="primary" @click="generateFile">生成文件</el-button>
        <el-button type="primary" @click="previewCode">预览代码</el-button>
        <el-button type="danger" @click="openWithCode">用Vscode打开</el-button>
        <el-button type="warning" @click="openWithExplorer">在资源管理器中打开</el-button>
        <el-button type="default" @click="previous">上一步</el-button>
      </div>
      <el-button v-show="!!content" style="float: right" @click="copyCode">复制代码</el-button>
    </div>
    <view-files :content="content" v-if="content" width="100%" height="800px" style="margin-top: 20px;"/>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import tableData from '@/mix/tableData.js'
import ViewFiles from '@/components/ViewFiles.vue'

export default {
  name: 'Generate',
  components: { ViewFiles },
  mixins: [tableData],
  data () {
    return {
      errorMessage: '',
      errorShow: false,
      generateForm: {
        suffix: 'vue',
        other: false,
        addPath: 'Edit',
        addEjsPath: 'Edit',
        api: false
      },
      successFilePath: '',
      content: ''
    }
  },
  created () {
    ipcRenderer.on('generateEntityFiles', (e, json) => {
      if (json.code !== 200) {
        this.$notify.error(json.msg)
      } else {
        this.$notify.success('成功!')
      }
    })

    ipcRenderer.on('generateCustomFiles', (e, json) => {
      if (json.code !== 200) {
        console.error(json.err)
        if (json.code === 'EEXIST') {
          this.$notify.error('文件已存在')
        } else {
          this.errorShow = true
          this.errorMessage = json.msg
        }
      } else {
        this.$notify.success('成功!')
        this.errorShow = false
        if (json.type === 'previewCode') {
          this.content = json.data
        } else {
          this.successFilePath = json.data
        }
      }
    })
  },
  beforeDestroy () {
    ipcRenderer.removeAllListeners('generateEntityFiles')
    ipcRenderer.removeAllListeners('generateCustomFiles')
    ipcRenderer.removeAllListeners('copyCode')
  },
  methods: {
    copyCode () {
      const clipboard = require('electron').clipboard
      clipboard.writeText(this.content)
      this.$message.success('已复制到剪切板')
    },
    previewCode () {
      this.generate('previewCode')
    },
    generateFile () {
      this.generate('file')
    },
    generate (type) {
      const template = this.$store.state.currentTemplate
      if (!template) {
        return this.$message.error('请在模板管理中选择一个模板')
      }
      const table = this.tableDataHide || this.tableData
      // 组装数据
      const insertList = table.filter(v => v.operating.indexOf('insert') !== -1)
      const queryList = table.filter(v => v.operating.indexOf('query') !== -1)
      const searchList = table.filter(v => v.operating.indexOf('search') !== -1)
      const requiredList = table.filter(v => v.operating.indexOf('required') !== -1)
      const json = {
        insertList,
        queryList,
        searchList,
        requiredList,
        suffix: this.generateForm.suffix,
        other: this.generateForm.other,
        generateForm: this.generateForm,
        templateName: template.ejs,
        name: this.generateForm.name,
        kdata: this.kdata,
        type
      }
      ipcRenderer.send('generateCustomFiles', json)

      if (this.rememberKey) {
        ipcRenderer.send('saveKeyValue', this.kdata)
      } else {
        ipcRenderer.send('saveKeyValue', [])
      }
    },
    openWithCode () {
      if (this.successFilePath) {
        ipcRenderer.send('transferCode', this.successFilePath)
      } else {
        this.$notify.error('请先生成文件')
      }
    },
    openWithExplorer () {
      if (this.successFilePath) {
        ipcRenderer.send('transferExplorer', this.successFilePath)
      } else {
        this.$notify.error('请先生成文件')
      }
    },
    previous () {
      this.$emit('previous')
    }
  }
}
</script>

<style lang="less" scoped>
.Generate {
  display: flex;
  flex-direction: column;

  .hidden {
    visibility: hidden;
  }

  pre {
    text-align: left;
    background: #fef0f0;
    color: #f56c6c;
    padding: 20px;
  }

  .left {
    width: 300px;
  }

  .right {
    flex: 1;
    display: flex;
    align-items: center;
    margin-left: 20px;
    margin-top: 20px;
    justify-content: space-between;
  }
}
</style>
