<template>
  <div id="app">
    <keep-alive>
      <router-view />
    </keep-alive>
  </div>
</template>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;

  // 主题色
  --primaryColor: #409eff;
  // 成功
  --successColor: #67c23a;
  // 警告
  --warningColor: #e6a23c;
  // 危险
  --dangerColor: #f56c6c;
  // 信息
  --infoColor: #909399;
}

.el-button--warning {
  background-color: var(--warningColor);
  border-color: var(--warningColor);
}

.el-button--primary {
  background-color: var(--primaryColor);
  border-color: var(--primaryColor);
}

.el-button--success {
  background-color: var(--successColor);
  border-color: var(--successColor);
}

.el-button--info {
  background-color: var(--infoColor);
  border-color: var(--infoColor);
}

.el-button--danger {
  background-color: var(--dangerColor);
  border-color: var(--dangerColor);
}

.el-checkbox__input.is-checked + .el-checkbox__label {
  color: var(--primaryColor);
}

.el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: var(--primaryColor);
  border-color: var(--primaryColor);
}

.el-input__inner:focus,
.el-select .el-input.is-focus .el-input__inner {
  border-color: var(--primaryColor);
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
