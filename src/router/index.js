import Vue from 'vue'
import VueRouter from 'vue-router'

// 在 VueCLI 创建的项目中 @ 表示 src 目录
// 它是 src 目录的路径别名
// 好处：它不受当前文件路径影响
// 注意：@ 就是 src 路径，后面别忘了写那个斜杠
// 使用建议：如果加载的资源路径就在当前目录下，那就正常写
//       如果需要进行父级路径查找的都使用 @
import Login from '@/views/login/';
import Home from '@/views/Home/';
Vue.use(VueRouter)

const routes = [{
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
  }, {
    // 我们通常会把根路径 / 设置为网站的首页
    // 为啥呢？因为我们在手动输入网址访问网站的时候，可以省略 /
    // 如果你是别的名称，则必须加上
    path: '/', // path 为空，会作为默认子路由渲染
    name: 'home',
    component: Home,
  }
]

const router = new VueRouter({
  routes
})

export default router