<template>
  <div id="app">
    <keep-alive>
      <router-view />
    </keep-alive>
    <el-dialog :title="title" width="40%" :visible.sync="visible">
      <component :is="component"></component>
    </el-dialog>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import CreateUser from './views/permission/CreateUser.vue'

export default {
  name: 'App',
  components: {
    CreateUser
  },
  data () {
    return {
      title: '',
      visible: false,
      component: ''
    }
  },
  created () {
    //  开启权限
    ipcRenderer.on('openPermissions', () => {
      this.component = 'create-user'
      this.visible = true
      this.title = '创建你的用户'
    })
  }
}
</script>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
