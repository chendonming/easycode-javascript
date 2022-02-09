<template>
  <div class="TemplateManagement">
    <div class="tool-btn">
      <el-button type="primary" @click="handleInsert">新增模板</el-button>
    </div>
    <div class="item-wrapper">
      <div class="item" :class="{'active': active && active.id === item.id}" v-for="item in list" :key="item.uuid">
        <div class="item-btns">
          <span>{{ item.name }}</span>
          <el-button type="text" @click="setCurrentTemplate(item)">使用此模板</el-button>
        </div>
        <el-image :src="item.picture" :preview-src-list="[item.picture]" alt=""/>
        <div class="bottom-btns">
          <el-button class="red" type="text" @click="handleDel(item)">删除此模板</el-button>
          <el-button type="text" @click="viewFile(item)">查看模板文件</el-button>
        </div>
      </div>
    </div>
    <el-dialog title="创建模板" width="400px" :visible.sync="show">
      <el-form :model="form" size="small" ref="form">
        <el-form-item label="名称" prop="name" required>
          <el-input clearable v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="图片" prop="picture" required>
          <el-input :value="form.picture" readonly @click.native="openDialog('picture')"></el-input>
        </el-form-item>
        <el-form-item label="ejs文件" prop="ejs" required>
          <el-input :value="form.ejs" readonly @click.native="openDialog('ejs')"></el-input>
        </el-form-item>
      </el-form>
      <template slot="footer">
        <el-button type="primary" @click="submit" size="small">确定
        </el-button>
        <el-button size="small" @click="show = false">取消</el-button>
      </template>
    </el-dialog>
    <el-dialog title="文件查看" :close-on-click-modal="false" width="850px" :visible.sync="fileShow">
      <view-files v-if="fileId" :id="fileId" width="800px" height="700px"/>
    </el-dialog>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import ViewFiles from '@/components/ViewFiles.vue'
import path from 'path'

export default {
  name: 'TemplateManagement',
  components: { ViewFiles },
  data () {
    return {
      fileId: '',
      fileShow: false,
      show: false,
      form: {
        name: '',
        picture: '',
        ejs: ''
      },
      type: '',
      pictureFilter: {
        name: '前端模板生成器-图片过滤器',
        extensions: ['png', 'jpg', 'gif']
      },
      ejsFilter: {
        name: '前端模板生成器-ejs文件过滤器',
        extensions: ['ejs']
      },
      list: []
    }
  },
  computed: {
    active () {
      return this.$store.state.currentTemplate
    }
  },
  created () {
    ipcRenderer.on('openFile', (e, files) => {
      if (files.length > 0) {
        if (this.type === 'picture') {
          this.form.picture = files[0]
        }
        if (this.type === 'ejs') {
          this.form.ejs = files[0]
        }
      }
    })

    // 查询模板
    ipcRenderer.send('TemplateManagementQuery')
    ipcRenderer.on('TemplateManagementQuery:success', (e, data) => {
      this.list = data
    })

    ipcRenderer.on('TemplateManagementAdd:success', () => {
      this.$message.success('模板新增成功!')
      ipcRenderer.send('TemplateManagementQuery')
      this.show = false
    })

    ipcRenderer.on('TemplateManagementAdd:error', (e, msg) => {
      this.$notify({
        title: '提示: 模板新增失败',
        message: msg,
        duration: 0
      })
    })

    ipcRenderer.on('getCurrentTemp:success', (e, data) => {
      this.$store.commit('setCurrentTemplate', data)
    })

    ipcRenderer.on('TemplateManagementDel:success', () => {
      this.$message.success('删除成功')
      ipcRenderer.send('TemplateManagementQuery')
    })

    if (!this.$store.state.currentTemplate) {
      ipcRenderer.send('getCurrentTemp')
    }
  },
  watch: {
    show (val) {
      if (!val) {
        this.$refs.form.resetFields()
      }
    }
  },
  beforeDestroy () {
    ipcRenderer.send('setCurrentTemp', this.$store.state.currentTemplate)
    ipcRenderer.removeAllListeners('openFile')
    ipcRenderer.removeAllListeners('TemplateManagementQuery:success')
    ipcRenderer.removeAllListeners('TemplateManagementAdd:success')
    ipcRenderer.removeAllListeners('TemplateManagementAdd:error')
    ipcRenderer.removeAllListeners('getCurrentTemp')
    ipcRenderer.removeAllListeners('TemplateManagementDel:success')
  },
  methods: {
    viewFile (item) {
      this.fileId = path.basename(item.ejs)
      this.fileShow = true
    },
    handleDel (item) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if (this.active.id === item.id) {
          this.$store.commit('setCurrentTemplate', null)
        }
        ipcRenderer.send('TemplateManagementDel', item)
      })
    },
    setCurrentTemplate (item) {
      this.$store.commit('setCurrentTemplate', item)
      this.$message.success('设置成功!')
    },
    handleInsert () {
      this.show = true
    },
    openDialog (type) {
      this.type = type

      ipcRenderer.send('openFile', {
        title: type === 'picture' ? '选择图片' : '选择Ejs文件',
        filters: [type === 'picture' ? this.pictureFilter : this.ejsFilter]
      })
    },
    submit () {
      this.$refs.form.validate(valid => {
        if (valid) {
          ipcRenderer.send('TemplateManagementAdd', this.form)
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.TemplateManagement {
  display: flex;
  flex-direction: column;
  padding: 20px;

  .tool-btn {
    text-align: left;
    margin-bottom: 20px;
  }

  .item-wrapper {
    text-align: left;

    .item {
      display: inline-flex;
      flex-direction: column;
      border: 1px solid #eee;
      padding: 5px 20px;
      cursor: pointer;

      .bottom-btns {
        text-align: left;
        display: flex;
        justify-content: space-between;

        .red.el-button--text {
          color: red;
        }
      }

      .item-btns {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      ::v-deep img {
        width: 200px;
        height: 100px;
        margin-top: 10px;
      }

      &:hover, &.active {
        border: 1px solid var(--primary);
      }
    }
  }
}
</style>
