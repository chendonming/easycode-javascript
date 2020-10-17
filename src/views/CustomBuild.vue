<template>
  <el-card>
    <div class="CustomBuild">
      <el-steps :active="active" simple finish-status="success">
        <el-step title="步骤 1 选择字段信息"></el-step>
        <el-step title="步骤 2 选择模板"></el-step>
        <el-step title="步骤 3 生成"></el-step>
      </el-steps>
      <el-row v-show="active === 0">
        <el-form inline size="small" label-width="80px" :model="form" ref="form" style="text-align: left">
          <el-form-item label="数据库" prop="database" required>
            <el-select v-model="form.database" filterable>
              <el-option v-for="(item, index) in databaseList" :value="item" :key="index"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="表" prop="table" required>
            <el-select v-model="form.table">
              <el-option v-for="(item, index) in tableList" :value="item" :key="index"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="" prop="">
            <el-button type="primary" @click="query">查询</el-button>
            <el-button type="warning" @click="nextStep">下一步</el-button>
          </el-form-item>
        </el-form>
      </el-row>
      <div v-show="active === 0">
        <el-table :data="tableData" style="width: 100%" stripe border>
          <el-table-column
            prop="Field"
            label="字段">
          </el-table-column>
          <el-table-column
            prop="Key"
            label="索引">
          </el-table-column>
          <el-table-column
            prop="Comment"
            label="注释">
          </el-table-column>
          <el-table-column
            prop="Type"
            label="类型">
          </el-table-column>
          <el-table-column label="操作" width="300px">
            <template slot-scope="scope">
              <el-checkbox-group v-model="scope.row.operating">
                <el-checkbox label="insert"></el-checkbox>
                <el-checkbox label="search"></el-checkbox>
                <el-checkbox label="query"></el-checkbox>
              </el-checkbox-group>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="file-select" v-show="active === 1">
        <el-upload
          class="upload-demo"
          action="test"
          :limit="1"
          :auto-upload="false"
          :on-change="handleChange"
          accept=".ejs"
          :file-list="fileList">
          <el-button size="small" type="primary">选择ejs模板文件</el-button>
        </el-upload>
        <el-button @click="nextStep" type="warning" size="small" style="margin-left: 10px;">下一步</el-button>
        <el-button @click="previous" type="default" size="small" style="margin-left: 10px;">上一步</el-button>
      </div>
      <div class="generate" v-show="active === 2">
        <div class="left">
          <el-form :model="generateForm" size="small">
            <el-form-item label="后缀名" prop="suffix">
              <el-input v-model="generateForm.suffix"></el-input>
            </el-form-item>
          </el-form>
        </div>
        <div class="right">
          <el-button type="primary" @click="generate">生成</el-button>
          <el-button type="danger" @click="openWithCode">用Vscode打开</el-button>
          <el-button type="warning" @click="openWithExplorer">在资源管理器中打开</el-button>
          <el-button type="default" @click="previous">上一步</el-button>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
  name: 'CustomBuild',
  data () {
    return {
      fileList: [],
      databaseList: [],
      tableList: [],
      tableData: [],
      form: {
        database: '',
        table: ''
      },
      active: 0,
      success: false,
      successFilePath: '',
      generateForm: {
        suffix: 'vue'
      }
    }
  },
  watch: {
    'form.database': {
      handler (val) {
        ipcRenderer.send('queryAllTables', val)
      }
    }
  },
  created () {
    ipcRenderer.send('showDatabase')
    ipcRenderer.on('showDatabase', (e, json) => {
      if (json.code !== 200) {
        this.$message.error(json.msg)
      } else {
        this.databaseList = json.data
      }
    })

    ipcRenderer.on('queryAllTables', (e, json) => {
      if (json.code !== 200) {
        this.$message.error(json.msg)
      } else {
        this.tableList = json.data
      }
    })

    ipcRenderer.on('displayField', (e, json) => {
      if (json.code !== 200) {
        this.$message.error(json.msg)
      } else {
        this.tableData = json.data.map(v => ({
          ...v,
          operating: []
        }))
      }
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
        this.$message.success('成功!')
      }
    })

    ipcRenderer.on('generateCustomFiles', (e, json) => {
      if (json.code !== 200) {
        this.$message.error(json.msg)
      } else {
        this.$message.success('成功!')
        this.successFilePath = json.data
      }
    })
  },
  methods: {
    // 生成
    generate () {
      // 组装数据
      const insertList = this.tableData.filter(v => v.operating.indexOf('insert') !== -1)
      const queryList = this.tableData.filter(v => v.operating.indexOf('query') !== -1)
      const searchList = this.tableData.filter(v => v.operating.indexOf('search') !== -1)
      const json = {
        insertList,
        queryList,
        searchList,
        suffix: this.generateForm.suffix,
        templateName: this.fileList[0].raw.path
      }
      ipcRenderer.send('generateCustomFiles', json)
    },
    query () {
      this.$refs.form.validate(valid => {
        if (valid) {
          ipcRenderer.send('displayField', this.form.database, this.form.table)
        }
      })
    },
    previous () {
      this.active--
    },
    openWithCode () {
      ipcRenderer.send('transferCode', this.successFilePath)
    },
    openWithExplorer () {
      ipcRenderer.send('transferExplorer', this.successFilePath)
    },
    nextStep () {
      // 验证
      console.log(this.fileList)
      if (this.active === 0) {
        const valid = this.tableData.some(v => v.operating.length !== 0)
        if (valid) {
          // 下一步
          this.active++
        } else {
          this.$notify.error({
            title: '提示',
            message: '操作栏中至少选择一项'
          })
        }
      } else if (this.active === 1) {
        if (this.fileList.length === 0) {
          this.$notify.error({
            title: '提示',
            message: '请选择一个ejs模板'
          })
        } else {
          this.active++
        }
      }
    },
    handleChange (file, fileList) {
      const fileName = file.raw.path
      const lastIndex = fileName.lastIndexOf('.')
      if (fileName.substring(lastIndex) !== '.ejs') {
        this.fileList = []
        this.$notify.error({
          title: '提示',
          message: '请选择ejs模板'
        })
      } else {
        this.fileList = fileList
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-steps {
  margin-bottom: 13px;
}

.file-select {
  text-align: left;
  display: flex;
  align-items: baseline;
}

.generate {
  display: flex;

  .left {
    width: 300px;
  }

  .right {
    flex: 1;
    display: flex;
    align-items: center;
    margin-left: 20px;
  }
}

</style>
