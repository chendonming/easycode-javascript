<template>
  <div class="EntityClassGeneration">
    <el-form :model="form" size="small">
      <el-form-item label="包名" prop="packageName">
        <el-input v-model="form.packageName" placeholder="例如: com.xl.backen.entity"></el-input>
      </el-form-item>
      <el-form-item label="数据库" prop="database">
        <el-select v-model="form.database" filterable>
          <el-option v-for="(item, index) in databaseList" :label="item" :key="index"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="表名" prop="tableName">
        <el-select v-model="form.tableName" placeholder="如果想生成所有的表，此选项不填">
          <el-option v-for="(item, index) in tableList" :label="item" :key="index"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="选择模板" prop="templateName">
        <el-select v-model="form.templateName">
          <el-option v-for="(item, index) in templateList" :label="item.title" :key="index"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="" prop="">
        <el-button type="primary">生成</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
/**
 * 生成实体类（测试）
 */
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

  }
}
</script>

<style scoped>

</style>
