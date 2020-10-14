<template>
  <div class="home">
    <el-container>
      <el-aside width="200px">
        <ul class="menu">
          <li class="menu-item active">生成实体类（测试）</li>
        </ul>
      </el-aside>
      <el-main>
        <router-view/>
      </el-main>
    </el-container>
    <el-dialog :visible.sync="visible" title="连接到MySql" width="30%" :close-on-click-modal="false">
      <el-form :model="form" size="small">
        <el-form-item label="IP地址" prop="host">
          <el-input clearable v-model="form.host"></el-input>
        </el-form-item>
        <el-form-item label="端口号" prop="port">
          <el-input clearable v-model="form.port"></el-input>
        </el-form-item>
        <el-form-item label="用户名" prop="user">
          <el-input clearable v-model="form.user"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input clearable v-model="form.password" type="password"></el-input>
        </el-form-item>
      </el-form>
      <template slot="footer">
        <el-button type="primary" size="small" @click="connectToTheDatabase" v-loading="loading">确定</el-button>
        <el-button size="small" @click="visible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
  name: 'Home',
  data () {
    return {
      visible: false,
      form: {
        host: '',
        port: '3306',
        user: '',
        password: ''
      },
      loading: false
    }
  },
  created () {
    ipcRenderer.on('connection', () => {
      this.visible = true
    })

    ipcRenderer.on('connection.success', () => {
      this.$message.success('连接成功')
      this.loading = false
      this.visible = false
    })

    ipcRenderer.on('connection.failed', () => {
      this.$message.error('连接失败')
      this.loading = false
    })
  },
  methods: {
    async connectToTheDatabase () {
      this.loading = true
      ipcRenderer.send('connectToTheDatabase', this.form)
    }
  }
}
</script>

<style lang="less">
.home {
  .menu {
    .menu-item {
      padding: 10px;
      cursor: pointer;

      &.active {
        background: #409EFF;
        color: #fff;
      }
    }
  }
}
</style>
