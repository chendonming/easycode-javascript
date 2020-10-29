<template>
  <div class="create-user">
    <el-form :model="form" label-width="80px" size="small">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username"></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
// TODO: 创建账号便于创建记事本
export default {
  name: 'CreateUser',
  data () {
    return {
      form: {
        username: '',
        password: ''
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
