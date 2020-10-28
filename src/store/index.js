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
    infoColor: '#909399'
  },
  mutations: {
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
    infoColor: state => state.infoColor
  },
  actions: {},
  modules: {}
})
