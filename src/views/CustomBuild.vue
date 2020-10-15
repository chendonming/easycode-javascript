<template>
  <div class="CustomBuild">
    <el-row>
      <el-form inline size="small" label-width="80px" :model="form" ref="form">
        <el-form-item label="数据库" prop="databases" required>
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
        </el-form-item>
      </el-form>
    </el-row>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
  name: 'CustomBuild',
  data () {
    return {
      databaseList: [],
      tableList: [],
      form: {
        database: ''
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
  },
  methods: {
    query () {
      this.$refs.form.validate(valid => {
        if (valid) {

        }
      })
    }
  }
}
</script>

<style scoped>

</style>
