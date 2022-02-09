export default {
  computed: {
    fileList: {
      get () { return this.$store.state.fileList },
      set (val) { this.$store.commit('setFileList', val) }
    }
  }
}
