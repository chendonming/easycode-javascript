<template>
  <div id="app">
    <keep-alive>
      <router-view />
    </keep-alive>
    <el-dialog :title="title" width="400px" :visible.sync="visible">
      <component :is="component"></component>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {
      title: '',
      visible: false,
      component: ''
    }
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
  overflow: hidden;
}

* {
  box-sizing: border-box;
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
