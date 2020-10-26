import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // 是否连接数据库
    connection: false
  },
  mutations: {
    setConnection (state, bool) {
      state.connection = bool
    }
  },
  getters: {
    connection: state => state.connection
  },
  actions: {},
  modules: {}
})
