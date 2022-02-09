<template>
  <el-table
    :data="tableDataHide || tableData"
    @current-change="currentChange"
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
    <el-table-column prop="Field" label="字段<驼峰>" width="120">
      <template slot-scope="scope">
        <span>{{camelCase(scope.row.Field)}}</span>
      </template>
    </el-table-column>
    <el-table-column prop="Comment" label="注释<对应前端界面的label>">
      <template slot-scope="scope">
        <el-input v-model="scope.row.Comment" size="small"></el-input>
      </template>
    </el-table-column>
    <el-table-column label="展示组件" prop="component">
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
    <el-table-column label="操作" width="500px">
      <template slot="header">
        <el-button
          @click="counterElection('insert')"
          size="small"
          type="default"
        >反选新增表单
        </el-button>
        <el-button
          @click="counterElection('search')"
          size="small"
          type="default"
        >反选搜索表单
        </el-button>
        <el-button
          @click="counterElection('query')"
          size="small"
          type="default"
        >反选查询表单
        </el-button>
        <el-button
          @click="counterElection('required')"
          size="small"
          type="default"
        >反选必填项
        </el-button>
      </template>
      <template slot-scope="scope">
        <el-checkbox-group v-model="scope.row.operating">
          <el-checkbox label="insert">新增表单</el-checkbox>
          <el-checkbox label="search">搜索表单</el-checkbox>
          <el-checkbox label="query">查询表单</el-checkbox>
          <el-checkbox label="required">必填</el-checkbox>
        </el-checkbox-group>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { ipcRenderer } from 'electron'
import Sortable from 'sortablejs'
import tableData from '@/mix/tableData.js'
import _ from 'lodash'

export default {
  name: 'FieldTable',
  mixins: [tableData],
  data () {
    return {
      // 当前选择行
      currentRow: null,
      // 组件列表文件
      componentList: []
    }
  },
  created () {
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

    ipcRenderer.on('displayField', (e, json) => {
      if (json.code !== 200) {
        this.$notify.error(json.msg)
      } else {
        const table = json.data.filter(v => v.Field.indexOf('id') === -1)
        this.tableData = table.map((v, i) => ({
          ...v,
          operating: [],
          index: i + 1
        }))
      }
    })
  },
  beforeDestroy () {
    ipcRenderer.removeAllListeners('loadComponentList')
    ipcRenderer.removeAllListeners('displayField')
  },
  mounted () {
    this.rowDrop()
  },
  methods: {
    camelCase (str) {
      return _.camelCase(str)
    },
    currentChange (row) {
      this.currentRow = row
    },
    counterElection (pos) {
      const data = this.tableData.map(v => {
        const index = v.operating.indexOf(pos)
        if (v.operating.indexOf(pos) !== -1) {
          v.operating.splice(index, 1)
        } else {
          v.operating.push(pos)
        }
        return v
      })

      this.$store.commit('setTableData', data)
    },
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
    }
  }
}
</script>

<style scoped>

</style>
