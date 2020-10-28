<template>
  <div class="home">
    <el-container>
      <el-aside width="200px">
        <ul class="menu">
          <li
            class="menu-item"
            :class="{ active: index === currentIndex }"
            @click="jumpRoute(item.path, index)"
            v-for="(item, index) in menuList"
            :key="index"
          >
            {{ item.label }}
          </li>
        </ul>
      </el-aside>
      <el-main>
        <router-view/>
      </el-main>
    </el-container>
    <el-dialog
      :visible.sync="visible"
      title="连接到MySql"
      width="40%"
      :close-on-click-modal="false"
    >
      <el-form :model="form" size="small">
        <el-form-item label="IP地址" prop="host" required>
          <el-input clearable v-model="form.host"></el-input>
        </el-form-item>
        <el-form-item label="端口号" prop="port" required>
          <el-input clearable v-model="form.port"></el-input>
        </el-form-item>
        <el-form-item label="用户名" prop="user" required>
          <el-input clearable v-model="form.user"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" required>
          <el-input
            clearable
            v-model="form.password"
            type="password"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="form.tryConnection">下次尝试使用缓存直接登录数据库</el-checkbox>
        </el-form-item>
      </el-form>
      <template slot="footer">
        <el-button
          type="primary"
          size="small"
          @click="connectToTheDatabase"
          v-loading="loading"
        >确定
        </el-button>
        <el-button size="small" @click="visible = false">取消</el-button>
      </template>
    </el-dialog>
    <!-- TODO: 暂时没有公告 -->
    <!--    <el-dialog :visible.sync="visibleDesc" title="说明" width="40%">-->
    <!--      <div>这是一些公告说明</div>-->
    <!--      <template slot="footer">-->
    <!--        <div style="display: flex;justify-content: space-between;">-->
    <!--          <el-checkbox v-model="settingForm.noTip">下次不在显示</el-checkbox>-->
    <!--        </div>-->
    <!--      </template>-->
    <!--    </el-dialog>-->

    <el-dialog
      :visible.sync="settingsVisible"
      width="40%"
      title="设置"
      :close-on-click-modal="false"
    >
      <el-form :model="settingForm" size="small">
        <!--        TODO: 目前没有实现-->
        <!--        <el-form-item label="默认的模板目录" prop="templateDirectory">-->
        <!--          <el-input-->
        <!--            :value="settingForm.templateDirectory"-->
        <!--            readonly-->
        <!--            @click.native="openDialog('templateDirectory')"-->
        <!--          ></el-input>-->
        <!--        </el-form-item>-->
        <el-form-item label="默认的文件生成目录" prop="fileGenerationDirectory">
          <el-input
            :value="settingForm.fileGenerationDirectory"
            readonly
            @click.native="openDialog('fileGenerationDirectory')"
          ></el-input>
        </el-form-item>
      </el-form>
      <template slot="footer">
        <el-button type="primary" @click="submit">确定</el-button>
        <el-button @click="settingsVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import { mapMutations } from 'vuex'

export default {
  name: 'Home',
  data () {
    return {
      visible: false,
      settingsVisible: false,
      form: {
        host: '',
        port: '',
        user: '',
        password: '',
        tryConnection: false
      },
      loading: false,
      visibleDesc: true,
      menuList: [
        {
          label: '前端CRUD生成',
          path: 'CustomBuild'
        }
      ],
      currentIndex: -1,
      settingForm: {
        fileGenerationDirectory: '',
        templateDirectory: ''
      },
      currentDirectoryType: ''
    }
  },
  created () {
    ipcRenderer.on('settings', () => {
      this.settingsVisible = true
    })

    ipcRenderer.on('connection', () => {
      this.visible = true
    })

    ipcRenderer.on('connection.success', () => {
      this.$notify.success('数据库连接成功')
      this.loading = false
      this.visible = false
      this.setConnection(true)
    })

    ipcRenderer.on('connection.failed', (e, json) => {
      this.$notify.error('连接失败: ' + json.msg)
      this.loading = false
    })

    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'r') {
        window.location.reload()
      }
    })

    // 选择默认模板目录
    ipcRenderer.on('openDirectory', (e, json) => {
      if (json.length > 0) {
        this.$set(this.settingForm, this.currentDirectoryType, json[0])
      }
    })

    ipcRenderer.send('getSetting')

    ipcRenderer.on('getSetting', (e, json) => {
      if (json && JSON.stringify(json) !== '{}') {
        this.settingForm = json
      }
    })

    ipcRenderer.send('getDataSource')
    ipcRenderer.on('getDataSource', (e, json) => {
      if (json && JSON.stringify(json) !== '{}') {
        this.form = json
        if (this.form.tryConnection) {
          this.connectToTheDatabase()
        }
      }
    })

    ipcRenderer.on('about', (e, json) => {
      if (json) {
        this.$router.push({ path: `/DocumentText?id=${json.id}&title=${json.title}` })
      }
    })
  },
  methods: {
    ...mapMutations(['setConnection']),
    async connectToTheDatabase () {
      this.loading = true
      ipcRenderer.send('connectToTheDatabase', this.form)
      ipcRenderer.send('saveDataSource', this.form)
    },
    jumpRoute (path, index) {
      this.$router.push({ path: '/' + path })
      this.currentIndex = index
    },
    openDialog (type) {
      this.currentDirectoryType = type
      ipcRenderer.send('openDirectory', {
        title: '选择默认模板目录'
      })
    },
    submit () {
      ipcRenderer.send('saveSetting', this.settingForm)
      this.settingsVisible = false
    }
  }
}
</script>

<style lang="less">
.home {
  height: 100vh;

  .el-main {
    padding-top: 0;
  }

  .menu {
    .menu-item {
      padding: 10px;
      cursor: pointer;

      &.active {
        background: #409eff;
        color: #fff;
      }
    }
  }

  .el-aside {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
    border-top: 1px solid #eee;
  }

  .el-container {
    height: 100%;
  }
}
</style>
