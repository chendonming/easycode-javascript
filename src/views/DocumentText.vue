<template>
  <div class="DocumentText">
    <el-page-header @back="goBack" :content="title">
    </el-page-header>
    <article class="article article-content markdown-body"
             style="text-align:left; padding: 20px;"
             v-html="html"></article>
  </div>
</template>

<script>
import { ipcRenderer, shell } from 'electron'
import marked from 'marked'
import 'github-markdown-css/github-markdown.css'

export default {
  name: 'DocumentText',
  data () {
    return {
      html: ''
    }
  },
  computed: {
    title () {
      return this.$route.query.title
    }
  },
  created () {
    const id = this.$route.query.id
    ipcRenderer.on('consultYourDocumentation', (e, json) => {
      if (json && JSON.stringify(json) !== '{}') {
        this.html = marked(json)
        this.$nextTick(() => {
          // 转用系统默认浏览器打开
          const links = document.querySelectorAll('a[href]')
          links.forEach(link => {
            link.addEventListener('click', e => {
              const url = link.getAttribute('href')
              e.preventDefault()
              shell.openExternal(url)
            })
          })
        })
      }
    })
    ipcRenderer.send('consultYourDocumentation', id)
  },
  methods: {
    goBack () {
      this.$router.go(-1)
    }
  }
}
</script>

<style lang="less" scoped>
.DocumentText {
  display: flex;
  flex-direction: column;
  height: 100vh;

  .el-page-header {
    flex-shrink: 0;
    padding: 20px;
  }

  article {
    flex: 1;
    height: 0;
    overflow: auto;
  }
}
</style>
