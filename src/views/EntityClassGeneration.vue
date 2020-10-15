<template>
  <div class="EntityClassGeneration">
    <el-form ref="form" :model="form" size="small" label-width="100px" label-position="right">
      <el-form-item label="包名" prop="packageName" required>
        <el-input v-model="form.packageName" placeholder="例如: com.xl.backen.entity"></el-input>
      </el-form-item>
      <el-form-item label="作者" prop="author">
        <el-input v-model="form.author"></el-input>
      </el-form-item>
      <el-form-item label="数据库" prop="database" required>
        <el-select v-model="form.database" filterable>
          <el-option v-for="(item, index) in databaseList" :value="item" :key="index"></el-option>
        </el-select>
        <el-button class="refresh" type="text" v-loading="d_loading" @click="refreshDatabases">刷新</el-button>
      </el-form-item>
      <el-form-item label="表名" prop="tableName">
        <el-select v-model="form.tableName">
          <el-option v-for="(item, index) in tableList" :value="item" :key="index"></el-option>
        </el-select>
        <span style="padding-left: 10px;"><i class="el-icon-info"></i>如果想生成所有的表，此选项不填</span>
      </el-form-item>
      <el-form-item label="选择模板" prop="templateName" required>
        <el-select v-model="form.templateName">
          <el-option v-for="(item, index) in templateList" :label="item.title" :value="item.value"
                     :key="index"></el-option>
        </el-select>
        <el-button class="refresh" type="text" v-loading="loading" @click="refreshTemplate">刷新</el-button>
        <div><i class="el-icon-info"></i>使用<span class="atag" @click="jump('https://ejs.bootcss.com/#promo')">ejs</span>模板</div>
      </el-form-item>
      <el-form-item label="" prop="">
        <el-button type="primary" @click="generate">生成</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
/**
 * 生成实体类（测试）
 */
import { ipcRenderer, shell } from 'electron'

export default {
  name: 'EntityClassGeneration',
  data () {
    return {
      form: {
        packageName: '',
        database: '',
        tableName: '',
        author: '',
        templateName: ''
      },
      databaseList: [],
      tableList: [],
      // 模板文件列表
      templateList: [],
      loading: false,
      d_loading: false
    }
  },
  created () {
    ipcRenderer.send('queryTemplateFile')
    ipcRenderer.on('queryTemplateFile', (e, json) => {
      if (json.code !== 200) {
        this.$message.error(json.msg)
      } else {
        this.templateList = json.data
      }
      setTimeout(() => {
        this.loading = false
      }, 500)
    })

    ipcRenderer.send('showDatabase')
    ipcRenderer.on('showDatabase', (e, json) => {
      if (json.code !== 200) {
        this.$message.error(json.msg)
      } else {
        this.databaseList = json.data
      }
      setTimeout(() => {
        this.d_loading = false
      }, 500)
    })

    ipcRenderer.on('queryAllTables', (e, json) => {
      if (json.code !== 200) {
        this.$message.error(json.msg)
      } else {
        this.tableList = json.data
      }
    })

    ipcRenderer.on('generateEntityFiles', (e, json) => {
      if (json.code !== 200) {
        this.$message.error(json.msg)
      } else {
        this.$message.success('成功!文件地址: ' + json.data)
      }
    })
  },
  watch: {
    'form.database': {
      handler (val) {
        ipcRenderer.send('queryAllTables', val)
      }
    }
  },
  methods: {
    jump (url) {
      shell.openExternal(url)
    },
    refreshTemplate () {
      this.loading = true
      ipcRenderer.send('queryTemplateFile')
    },
    refreshDatabases () {
      this.d_loading = true
      ipcRenderer.send('showDatabase')
    },
    generate () {
      this.$refs.form.validate(valid => {
        if (valid) {
          ipcRenderer.send('generateEntityFiles', this.form)
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.refresh {
  margin-left: 10px;
}
</style>
