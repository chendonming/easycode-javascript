<template>
  <div class="ChooseTemplate">
    <el-select
      v-model="localFile"
      size="small"
      placeholder="预设模板文件"
      clearable
      style="margin-right: 10px"
    >
      <el-option
        v-for="(item, index) in localTemplateFile"
        :key="index"
        :label="item.title"
        :value="item.value"
      ></el-option>
    </el-select>
    <el-upload
      class="upload-demo"
      action="test"
      :limit="1"
      :auto-upload="false"
      :on-change="handleChange"
      :on-remove="onRemove"
      :file-list="fileList"
    >
      <el-button size="small" type="primary">选择ejs模板文件</el-button>
    </el-upload>
    <el-button
      @click="nextStep"
      type="warning"
      size="small"
      style="margin-left: 10px"
    >下一步
    </el-button>
    <el-button
      @click="previous"
      type="default"
      size="small"
      style="margin-left: 10px"
    >上一步
    </el-button>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import fileData from '@/mix/fileData.js'

export default {
  name: 'ChooseTemplate',
  mixins: [fileData],
  data () {
    return {
      // 本地模板文件
      localTemplateFile: []
    }
  },
  created () {
    // 加载模板文件
    ipcRenderer.send('localTemplateFile')
    ipcRenderer.on('localTemplateFile', (e, json) => {
      if (json && json.length > 0) {
        this.localTemplateFile = json
      }
    })
  },
  methods: {
    nextStep () {
      this.$emit('nextStep')
    },
    previous () {
      this.$emit('previous')
    },
    handleChange (file, fileList) {
      this.fileList = fileList
    },
    onRemove () {
      this.fileList = []
    }
  }
}
</script>

<style scoped>
.ChooseTemplate {
  text-align: left;
  display: flex;
  align-items: baseline;
}
</style>
