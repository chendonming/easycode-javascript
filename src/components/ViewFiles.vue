<template>
  <div class="ViewFiles" ref="ViewFiles" :style="`width: ${width}; height: ${height}`"></div>
</template>

<script>
import { ipcRenderer } from 'electron'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js'
import 'monaco-editor/esm/vs/basic-languages/html/html.contribution.js'
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution.js'
import 'monaco-editor/esm/vs/editor/contrib/find/findController.js'

/**
 * 查看代码文件
 */
export default {
  name: 'ViewFiles',
  props: {
    // 文件id
    id: String,
    content: String,
    title: String,
    width: String,
    height: String
  },
  watch: {
    id () {
      if (!this.content) { this.query() }
    },
    content (val) {
      this.createCode(val)
    }
  },
  beforeDestroy () {
    ipcRenderer.removeAllListeners('consultYourDocumentation')
    this.instance.dispose()
  },
  mounted () {
    ipcRenderer.on('consultYourDocumentation', (e, json) => {
      if (json && JSON.stringify(json) !== '{}') {
        this.createCode(json)
      }
    })

    if (!this.content) { this.query() } else {
      this.createCode(this.content)
    }
  },
  methods: {
    createCode (json) {
      if (this.instance) this.instance.dispose()
      this.instance = monaco.editor.create(this.$refs.ViewFiles, {
        value: json,
        language: 'html',
        wrappingIndent: 'indent',
        theme: 'vs-dark',
        wordWrap: 'on'
      })
    },
    goBack () {
      this.$router.go(-1)
    },
    query () {
      ipcRenderer.send('consultYourDocumentation', this.id, '../static/ejs')
    }
  }
}
</script>

<style scoped>
.ViewFiles {
  text-align: left;
}
</style>
