import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // 是否连接数据库
    connection: false,
    primaryColor: '#409eff',
    successColor: '#67c23a',
    warningColor: '#e6a23c',
    dangerColor: '#f56c6c',
    infoColor: '#909399',
    title: 'EasyCode',

    tableDataHide: null,
    tableData: [],
    localFile: '',
    fileList: [],
    rememberKey: true,
    kdata: []
  },
  mutations: {
    setKdata (state, data) {
      state.kdata = data
    },
    setRememberKey (state, key) {
      state.rememberKey = key
    },
    setFileList (state, fileList) {
      state.fileList = fileList
    },
    setLocalFile (state, localFile) {
      state.localFile = localFile
    },
    setTableData (state, tableData) {
      state.tableData = tableData
    },
    setTableDataHide (state, tableDataHide) {
      state.tableDataHide = tableDataHide
    },
    setTitle (state, title) {
      state.title = title
    },
    setPrimaryColor (state, color) {
      state.primaryColor = color
    },
    setSuccessColor (state, color) {
      state.successColor = color
    },
    setWarningColor (state, color) {
      state.warningColor = color
    },
    setDangerColor (state, color) {
      state.dangerColor = color
    },
    setInfoColor (state, color) {
      state.infoColor = color
    },
    setConnection (state, bool) {
      state.connection = bool
    }
  },
  getters: {
    connection: state => state.connection,
    primaryColor: state => state.primaryColor,
    successColor: state => state.successColor,
    warningColor: state => state.warningColor,
    dangerColor: state => state.dangerColor,
    infoColor: state => state.infoColor,
    title: state => state.title,
    tableDataHide: state => state.tableDataHide,
    tableData: state => state.tableData
  },
  actions: {},
  modules: {}
})
