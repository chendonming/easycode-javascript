export default {
  computed: {
    localFile: {
      get () { return this.$store.state.localFile },
      set (val) { this.$store.commit('setLocalFile', val) }
    },
    fileList: {
      get () { return this.$store.state.fileList },
      set (val) { this.$store.commit('setFileList', val) }
    }
  }
}
