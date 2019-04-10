import Vue from 'vue'
import Router from 'vue-router'

import main from '@/views/main'
import login from '@/views/login'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '*',
      redirect: '/'
    },
    {
      path: '/main',
      component: main,
      meta: {
        require: true,
        name: '聊天室'
      }
    },
    {
      path: '/login',
      component: login,
      meta: {
        require: true,
        name: '登录'
      }
    }
  ]
})
