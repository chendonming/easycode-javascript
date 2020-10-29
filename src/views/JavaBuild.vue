<template>
  <el-card>
    <div class="JavaBuild">
      <el-steps :active="active" simple finish-status="success">
        <el-step title="步骤 1 选择表"></el-step>
        <el-step title="步骤 2 选择生成范围设置"></el-step>
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
          <el-form-item label="" prop="">
            <el-button type="warning" @click="nextStep">下一步</el-button>
          </el-form-item>
        </el-form>
      </el-row>
      <div v-show="active === 0" class="table-list">
        <el-checkbox-group v-model="tableListSelect">
          <el-checkbox
            v-for="(item, index) in tableList"
            :label="item"
            :key="index"
          ></el-checkbox>
        </el-checkbox-group>
      </div>
      <el-row v-show="active === 1" class="setting-form">
        <el-form :model="settingForm" inline
          size="small"
          label-width="80px"
          ref="settingForm"
          style="text-align: left">
          <el-form-item label="包名" prop="packageName">
            <el-input v-model="settingForm.packageName" placeholder="包名, eg: com.pit.module"></el-input>
          </el-form-item>
          <el-form-item label="范围" prop="scope">
            <el-checkbox-group v-model="settingForm.scope">
              <el-checkbox label="Entity"></el-checkbox>
              <el-checkbox label="dto"></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </el-row>
    </div>
  </el-card>
</template>

<script>
/**
 * 暂时不排进工作进度
 * TODO
 */
import { ipcRenderer } from 'electron'
export default {
  name: 'JavaBuild',
  data () {
    return {
      active: 0,
      form: {
        database: ''
      },
      settingForm: {},
      tableList: [],
      databaseList: [],
      tableListSelect: []
    }
  },
  created () {
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
    })
  },
  methods: {
    nextStep () {

    }
  },
  watch: {
    'form.database': {
      handler (val) {
        ipcRenderer.send('queryAllTables', val)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-steps {
  margin-bottom: 13px;
}

.table-list {
  /deep/.el-checkbox{
    width: 33.333%;
    box-sizing: border-box;
    text-align: left;
    margin: 0;
  }
}
</style>
