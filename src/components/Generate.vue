<template>
  <div class="Generate">
    <el-alert
      :title="errorMessage"
      type="error"
      effect="dark"
      v-show="errorShow"
    >
    </el-alert>
    <div class="right">
      <el-button type="primary" @click="generate">生成</el-button>
      <el-button type="danger" @click="openWithCode">用Vscode打开</el-button>
      <el-button type="warning" @click="openWithExplorer">在资源管理器中打开</el-button>
      <el-button type="default" @click="previous">上一步</el-button>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import tableData from '@/mix/tableData.js'
import fileData from '@/mix/fileData.js'

export default {
  name: 'Generate',
  mixins: [tableData, fileData],
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
      successFilePath: ''
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
        this.successFilePath = json.data
      }
    })
  },
  methods: {
    generate () {
      const table = this.tableDataHide || this.tableData
      // 组装数据
      const insertList = table.filter(v => v.operating.indexOf('insert') !== -1)
      const queryList = table.filter(v => v.operating.indexOf('query') !== -1)
      const searchList = table.filter(v => v.operating.indexOf('search') !== -1)
      const json = {
        insertList,
        queryList,
        searchList,
        suffix: this.generateForm.suffix,
        other: this.generateForm.other,
        generateForm: this.generateForm,
        templateName: this.localFile || this.fileList[0].raw.path,
        name: this.generateForm.name,
        kdata: this.kdata
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

<style scoped>

</style>