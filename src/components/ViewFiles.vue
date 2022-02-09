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
    title: String,
    width: String,
    height: String
  },
  watch: {
    id () {
      this.query()
    }
  },
  beforeDestroy () {
    ipcRenderer.removeAllListeners('consultYourDocumentation')
    this.instance.dispose()
  },
  mounted () {
    ipcRenderer.on('consultYourDocumentation', (e, json) => {
      if (json && JSON.stringify(json) !== '{}') {
        this.instance = monaco.editor.create(this.$refs.ViewFiles, {
          value: json,
          language: 'html',
          wordWrap: 'wordWrapColumn',
          wordWrapColumn: 78,
          // Set this to false to not auto word wrap minified files
          wordWrapMinified: true,
          // try "same", "indent" or "none"
          wrappingIndent: 'indent',
          theme: 'vs-dark'
        })
      }
    })

    this.query()
  },
  methods: {
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
