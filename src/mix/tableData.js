export default {
  computed: {
    tableDataHide: {
      get () { return this.$store.state.tableDataHide },
      set (val) { this.$store.commit('setTableDataHide', val) }
    },
    tableData: {
      get () { return this.$store.state.tableData },
      set (val) { this.$store.commit('setTableData', val) }
    },
    rememberKey: {
      get () { return this.$store.state.rememberKey },
      set (val) { this.$store.commit('setRememberKey', val) }
    },
    kdata: {
      get () { return this.$store.state.kdata },
      set (val) { this.$store.commit('setKdata', val) }
    }
  }
}
