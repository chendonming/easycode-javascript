<template>
  <el-card>
    <div class="CustomBuild">
      <el-steps :active="active" simple finish-status="success">
        <el-step title="步骤 1 选择字段信息"></el-step>
        <el-step title="步骤 2 选择模板"></el-step>
        <el-step title="步骤 3 生成"></el-step>
      </el-steps>
      <el-row v-show="active === 0">
        <el-form
          inline
          size="small"
          label-width="80px"
          :model="form"
          ref="form"
          style="text-align: left"
        >
          <el-form-item label="数据库" prop="database" required>
            <el-select v-model="form.database" filterable>
              <el-option
                v-for="(item, index) in databaseList"
                :value="item"
                :key="index"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="表" prop="table" required>
            <el-select v-loading="tableLoading" v-model="form.table" multiple filterable>
              <el-option
                v-for="(item, index) in tableList"
                :value="item"
                :key="index"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="" prop="">
            <el-button type="warning" @click="nextStep">下一步</el-button>
            <el-button type="success" size="small" @click="kvisible = true"
              >设置属性</el-button
            >
            <el-checkbox
              v-model="hideFieldsWithoutComments"
              style="margin-left: 5px"
              >隐藏没有注释的字段</el-checkbox
            >
          </el-form-item>
        </el-form>
      </el-row>
      <div v-show="active === 0">
        <el-table
          :data="tableDataHide || tableData"
          @current-change="currenChange"
          row-key="index"
          style="width: 100%"
          border
          highlight-current-row
          ref="tableData"
        >
          <el-table-column
            prop="index"
            label="序号"
            width="60"
          ></el-table-column>
          <el-table-column prop="Field" label="字段" width="120">
            <template slot-scope="scope">
              <el-input v-model="scope.row.Field" size="small"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="Comment" label="注释">
            <template slot-scope="scope">
              <el-input v-model="scope.row.Comment" size="small"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="组件" prop="component">
            <template slot-scope="scope">
              <el-select
                v-model="scope.row.component"
                filterable
                clearable
                size="small"
              >
                <el-option
                  v-for="(item, index) in componentList"
                  :key="index"
                  :label="item.name"
                  :value="item.value"
                ></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="400px">
            <template slot="header">
              <el-button
                @click="counterElection('insert')"
                size="small"
                type="default"
                >反选insert
              </el-button>
              <el-button
                @click="counterElection('search')"
                size="small"
                type="default"
                >反选search
              </el-button>
              <el-button
                @click="counterElection('query')"
                size="small"
                type="default"
                >反选query
              </el-button>
            </template>
            <template slot-scope="scope">
              <el-checkbox-group v-model="scope.row.operating">
                <el-checkbox label="insert"></el-checkbox>
                <el-checkbox label="search"></el-checkbox>
                <el-checkbox label="query"></el-checkbox>
              </el-checkbox-group>
              <div style="margin-left: 10px; display: inline-block">
                <el-button
                  type="text"
                  v-if="scope.$index !== 0"
                  class="el-icon-top"
                  @click.stop="top(scope)"
                  >上移
                </el-button>
                <el-button
                  type="text"
                  v-if="scope.$index < tableData.length - 1"
                  class="el-icon-bottom"
                  @click.stop="bottom(scope)"
                  >下移
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="file-select" v-show="active === 1">
        <el-select
          v-model="localFile"
          size="small"
          placeholder="预设模板文件"
          clearable
          style="margin-right: 10px"
        >
          <el-option
            v-for="(item, index) in localTemplateFile"
            :key="index"
            :label="item.title"
            :value="item.value"
          ></el-option>
        </el-select>
        <el-upload
          class="upload-demo"
          action="test"
          :limit="1"
          :auto-upload="false"
          :on-change="handleChange"
          :on-remove="onRemove"
          :file-list="fileList"
        >
          <el-button size="small" type="primary">选择ejs模板文件</el-button>
        </el-upload>
        <el-button
          @click="nextStep"
          type="warning"
          size="small"
          style="margin-left: 10px"
          >下一步
        </el-button>
        <el-button
          @click="previous"
          type="default"
          size="small"
          style="margin-left: 10px"
          >上一步
        </el-button>
      </div>
      <div class="generate" v-show="active === 2">
        <el-alert
          :title="errorMessage"
          type="error"
          effect="dark"
          v-show="errorShow"
        >
        </el-alert>
        <div class="right">
          <el-button type="primary" @click="generate">生成</el-button>
          <el-button type="danger" @click="openWithCode"
            >用Vscode打开
          </el-button>
          <el-button type="warning" @click="openWithExplorer"
            >在资源管理器中打开
          </el-button>
          <el-button type="default" @click="previous">上一步</el-button>
        </div>
      </div>
    </div>
    <el-dialog :visible.sync="kvisible" title="Key Value属性列表">
      <div class="keyvalue tal">
        <el-row class="ptb10">
          <el-button type="primary" size="small" @click="add">添加</el-button>
          <el-button type="danger" size="small" @click="del">删除</el-button>
        </el-row>
        <el-checkbox v-model="rememberKey"
          >记住列表数据方便下次填写数据</el-checkbox
        >
        <el-table
          :data="kdata"
          style="width: 100%"
          border
          highlight-current-row
          ref="table"
          @current-change="change"
          row-key="id"
        >
          <el-table-column label="key" prop="key">
            <template slot-scope="scope">
              <el-input size="small" v-model="scope.row.key"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="value" prop="value">
            <template slot-scope="scope">
              <el-input size="small" v-model="scope.row.value"></el-input>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="jsonVisible" title="从swagger粘贴JSON">
      <div style="text-align: left; line-height: 21px">
        <i class="el-icon-info"></i>如果不能从数据库拿到想要的字段，
        例如：多表联查有时后端会更改从表字段名称。将swagger等API文档中复制新增时的JSON
      </div>
      <el-input type="textarea" :rows="8" v-model="swaggerJSON"></el-input>
      <template slot="footer">
        <el-button type="primary" @click="jsonSubmit">确定</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script>
import { ipcRenderer } from 'electron'
import { mapGetters } from 'vuex'
import { v4 as uuidv4 } from 'uuid'
import Sortable from 'sortablejs'

export default {
  name: 'CustomBuild',
  data () {
    return {
      swaggerJSON: '',
      jsonVisible: false,
      kvisible: false,
      hideFieldsWithoutComments: false,
      kdata: [],
      fileList: [],
      databaseList: [],
      tableList: [],
      tableData: [],
      tableDataHide: null,
      form: {
        database: '',
        table: []
      },
      active: 0,
      success: false,
      successFilePath: '',
      generateForm: {
        suffix: 'vue',
        other: false,
        addPath: 'Edit',
        addEjsPath: 'Edit',
        api: false
      },
      counterElectionQuery: true,
      counterElectionInsert: true,
      counterElectionSearch: true,
      // 本地模板文件
      localTemplateFile: [],
      localFile: '',
      // 组件列表文件
      componentList: [],
      currentKeyVal: null,
      // 当前选择行
      currentRow: null,
      rememberKey: true,
      errorShow: false,
      errorMessage: '',
      // 表输入框loading
      tableLoading: false
    }
  },
  watch: {
    'form.database': {
      handler (val) {
        this.tableLoading = true
        ipcRenderer.send('queryAllTables', val)
      }
    },
    'form.table': {
      handler () {
        this.query()
      }
    },
    hideFieldsWithoutComments (val) {
      if (val) {
        this.tableDataHide = this.tableData.filter((v) => v.Comment)
      } else {
        this.tableDataHide = null
      }
    },
    connection () {
      ipcRenderer.send('showDatabase')
    },
    counterElectionQuery () {
      this.counterElection('query')
    },
    counterElectionInsert () {
      this.counterElection('insert')
    },
    counterElectionSearch () {
      this.counterElection('search')
    }
  },
  created () {
    document.addEventListener('refreshDB', () => {
      ipcRenderer.send('showDatabase')
    })

    ipcRenderer.send('getKeyValue')
    ipcRenderer.on('getKeyValue', (e, json) => {
      if (
        json.code === 200 &&
        json.data &&
        Object.prototype.toString.call(json.data) === '[object Array]'
      ) {
        this.kdata = json.data
      }
    })

    ipcRenderer.send('showDatabase')
    ipcRenderer.on('showDatabase', (e, json) => {
      if (json.code !== 200) {
        this.$notify.error(json.msg)
      } else {
        this.databaseList = json.data
      }
    })

    ipcRenderer.on('queryAllTables', (e, json) => {
      if (json.code !== 200) {
        this.$notify.error(json.msg)
      } else {
        this.tableList = json.data
      }
      this.tableLoading = false
    })

    ipcRenderer.on('displayField', (e, json) => {
      if (json.code !== 200) {
        this.$notify.error(json.msg)
      } else {
        this.tableData = json.data.map((v, i) => ({
          ...v,
          operating: [],
          index: i + 1
        }))
      }
    })

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

    // 加载模板文件
    ipcRenderer.send('localTemplateFile')
    ipcRenderer.on('localTemplateFile', (e, json) => {
      if (json && json.length > 0) {
        this.localTemplateFile = json
      }
    })

    // 加载组件列表文件
    ipcRenderer.send('loadComponentList')
    ipcRenderer.on('loadComponentList', (e, data) => {
      if (data) {
        try {
          this.componentList = JSON.parse(data)
        } catch (e) {
          this.$notify.error({
            title: '提示',
            message: '组件列表加载失败'
          })
        }
      }
    })
  },
  computed: {
    ...mapGetters(['connection'])
  },
  mounted () {
    this.rowDrop()
  },
  methods: {
    rowDrop () {
      const tbody = document.querySelector('.el-table__body-wrapper tbody')
      const _this = this
      Sortable.create(tbody, {
        //  指定父元素下可被拖拽的子元素
        draggable: '.el-table__row',
        onEnd ({ newIndex, oldIndex }) {
          const table = _this.tableDataHide || _this.tableData
          const currRow = table.splice(oldIndex, 1)[0]
          table.splice(newIndex, 0, currRow)
        }
      })
    },
    currenChange (row) {
      this.currentRow = row
    },
    jsonSubmit () {
      this.jsonVisible = false
    },
    top (scope) {
      const index = scope.$index
      const table = this.tableDataHide || this.tableData
      if (index === 0) return
      table.splice(index - 1, 0, table[index])
      table.splice(index + 1, 1)
      this.$refs.tableData.setCurrentRow(table[index - 1])
    },
    bottom (scope) {
      const index = scope.$index
      const table = this.tableDataHide || this.tableData
      if (index === this.tableData.length - 1) return
      table.splice(index + 2, 0, table[index])
      table.splice(index, 1)
      this.$refs.tableData.setCurrentRow(table[index + 1])
    },
    add () {
      this.kdata.push({ id: uuidv4(), key: '', value: '' })
    },
    del () {
      if (this.currentKeyVal) {
        const findex = this.kdata.findIndex(
          (v) => v.id === this.currentKeyVal.id
        )
        if (typeof findex === 'number') {
          this.kdata.splice(findex, 1)
        }
      }
    },
    change (currentRow) {
      this.currentKeyVal = currentRow
    },
    counterElection (pos) {
      this.tableData = this.tableData.map((v) => {
        const index = v.operating.indexOf(pos)
        if (v.operating.indexOf(pos) !== -1) {
          v.operating.splice(index, 1)
        } else {
          v.operating.push(pos)
        }
        return v
      })
    },
    // 生成
    generate () {
      const table = this.tableDataHide || this.tableData
      // 组装数据
      const insertList = table.filter(
        (v) => v.operating.indexOf('insert') !== -1
      )
      const queryList = table.filter(
        (v) => v.operating.indexOf('query') !== -1
      )
      const searchList = table.filter(
        (v) => v.operating.indexOf('search') !== -1
      )
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
    query () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          ipcRenderer.send('displayField', this.form.database, this.form.table)
        }
      })
    },
    previous () {
      this.active--
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
    nextStep () {
      // 验证
      if (this.active === 0) {
        const valid = this.tableData.some((v) => v.operating.length !== 0)
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
        console.log('fileList------------>', this.fileList)
        console.log('localFile---------->', this.localFile)
        if (this.fileList.length === 0 && !this.localFile) {
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
      this.fileList = fileList
    },
    onRemove () {
      this.fileList = []
    }
  }
}
</script>

<style lang="less" scoped>
.el-steps {
  margin-bottom: 13px;
}

/deep/ .el-table__body tr.current-row > td {
  background-color: var(--warning);
  color: #fff;

  .el-button--text,
  .el-checkbox {
    color: #fff;
  }
}

.file-select {
  text-align: left;
  display: flex;
  align-items: baseline;
}

/deep/ .el-checkbox-group {
  display: inline-block;
}

.generate {
  display: flex;
  flex-direction: column;

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
