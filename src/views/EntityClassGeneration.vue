<template>
  <div class="EntityClassGeneration">
    <el-form ref="form" :model="form" size="small" label-width="100px" label-position="right">
      <el-form-item label="包名" prop="packageName" required>
        <el-input v-model="form.packageName" placeholder="例如: com.xl.backen.entity"></el-input>
      </el-form-item>
      <el-form-item label="数据库" prop="database" required>
        <el-select v-model="form.database" filterable>
          <el-option v-for="(item, index) in databaseList" :label="item" :key="index"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="表名" prop="tableName">
        <el-select v-model="form.tableName">
          <el-option v-for="(item, index) in tableList" :label="item" :key="index"></el-option>
        </el-select>
        <span style="padding-left: 10px;"><i class="el-icon-info"></i>如果想生成所有的表，此选项不填</span>
      </el-form-item>
      <el-form-item label="选择模板" prop="templateName" required>
        <el-select v-model="form.templateName">
          <el-option v-for="(item, index) in templateList" :label="item.title" :key="index"></el-option>
        </el-select>
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
import { remote } from 'electron'

export default {
  name: 'EntityClassGeneration',
  data () {
    return {
      form: {
        packageName: '',
        database: '',
        tableName: ''
      },
      databaseList: [],
      tableList: [],
      // 模板文件列表
      templateList: []
    }
  },
  created () {
    console.log(remote.app.getPath('userData') + '\\template')
  },
  methods: {
    generate () {
      this.$refs.form.validate(valid => {
        if (valid) {

        }
      })
    }
  }
}
</script>

<style lang="less" scoped>

</style>
