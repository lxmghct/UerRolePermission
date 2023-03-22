import Vue from 'vue'

import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // a modern alternative to CSS resets

import Element from 'element-ui'
import './styles/element-variables.scss'
import enLang from 'element-ui/lib/locale/lang/zh-CN'// 如果使用中文语言包请默认支持，无需额外引入，请删除该依赖
import axios from 'axios'
import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import './icons' // icon
import './permission' // permission control

import * as filters from './filters' // global filters
Vue.prototype.HOST = 'http://localhost:8095/'

// 路由采集插件
import tracing from 'web-tracing'
Vue.use(tracing, {
  requestUrl: 'manage/operatingLog/importOperatingLog',
  appName: '管理系统',
  event: {
    core: true,
    unload: false
  },
  // eslint-disable-next-line no-undef
  ext: { ip: localStorage.getItem('Ip') }
})
tracing.setUserUuid(localStorage.getItem('userId'))

Vue.use(Element, {
  size: Cookies.get('size') || 'medium', // set element-ui default size
  locale: enLang // 如果使用中文，无需设置，请删除
})

// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false
Vue.prototype.$http = axios
Vue.prototype.$axios = axios

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})

// axios拦截器, 默认增加请求头token
axios.interceptors.request.use(
  config => {
    if (sessionStorage.getItem('loginInformation') !== 'undefined' && sessionStorage.getItem('loginInformation') !== null) {
      config.headers.Authorization = JSON.parse(sessionStorage.getItem('loginInformation')).token
    }
    return config
  },
  err => {
    return Promise.reject(err)
  }
)

// axios若返回非200状态码, 则message提示
axios.interceptors.response.use(
  (res) => {
    if (res.data.status !== 200) {
      Element.Message.error(res.data.message)
      return Promise.reject(res)
    } else {
      return res
    }
  },
  (error) => {
    Element.Message.error('请求失败，请稍后重试')
    return Promise.reject(error)
  }
)
