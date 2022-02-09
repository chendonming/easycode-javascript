<template>
  <div class="DataSource">
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
        <el-select
          v-loading="tableLoading"
          v-model="form.table"
          multiple
          filterable
        >
          <el-option
            v-for="(item, index) in tableList"
            :label="`${item.TABLE_NAME}${item.TABLE_COMMENT ? '-' + item.TABLE_COMMENT : ''}`"
            :value="item.TABLE_NAME"
            :key="index"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="" prop="">
        <el-button type="warning" @click="nextStep">下一步</el-button>
        <el-button type="success" size="small" @click="visible = true">设置属性</el-button>
        <el-checkbox v-model="hideFieldsWithoutComments" style="margin-left: 5px">隐藏没有注释的字段</el-checkbox>
      </el-form-item>
    </el-form>

    <el-alert
      style="margin-bottom: 10px; "
      title="下面的table 行可按住拖拽改变顺序"
      type="success">
    </el-alert>

    <el-dialog :visible.sync="visible" title="Key Value属性列表">
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
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import tableData from '@/mix/tableData.js'
import { v4 as uuidv4 } from 'uuid'
import { mapGetters } from 'vuex'

export default {
  name: 'DataSource',
  mixins: [tableData],
  data () {
    return {
      form: {
        database: '',
        table: []
      },
      databaseList: [],
      // 表输入框loading
      tableLoading: false,
      tableList: [],
      hideFieldsWithoutComments: false,
      visible: false,
      currentKeyVal: null
    }
  },
  computed: {
    ...mapGetters(['connection'])
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
  },
  beforeDestroy () {
    ipcRenderer.removeAllListeners('getKeyValue')
    ipcRenderer.removeAllListeners('showDatabase')
    ipcRenderer.removeAllListeners('queryAllTables')
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
        this.tableDataHide = this.tableData.filter(v => v.Comment)
      } else {
        this.tableDataHide = null
      }
    },
    connection () {
      ipcRenderer.send('showDatabase')
    }
  },
  methods: {
    change (currentRow) {
      this.currentKeyVal = currentRow
    },
    del () {
      if (this.currentKeyVal) {
        const findex = this.kdata.findIndex(v => v.id === this.currentKeyVal.id)
        if (typeof findex === 'number') {
          this.kdata.splice(findex, 1)
        }
      }
    },
    add () {
      this.kdata.push({ id: uuidv4(), key: '', value: '' })
    },
    query () {
      this.$refs.form.validate(valid => {
        if (valid) {
          ipcRenderer.send('displayField', this.form.database, this.form.table)
        }
      })
    },
    nextStep () {
      this.$emit('nextStep')
    }
  }
}
</script>

<style scoped>

</style>
