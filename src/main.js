/* 
项目的启动入口
*/
import Vue from 'vue'
// 导入根组件
import App from './App.vue'
// 导入路由
import router from './router'


// 导入 ElementUI 
import ElementUI from 'element-ui';
// 导入 ElementUI 样式
import 'element-ui/lib/theme-chalk/index.css';
// 注册 ElementUI
Vue.use(ElementUI);

// 导入全局样式文件
import './styles/index.less';

Vue.config.productionTip = false

// 创建 vue 根实例
// 把 router 配置到根实例中
// 通过 render 方法把 App 根组件渲染到 #app 入口节点
new Vue({
  router,
  render: h => h(App)
  // el: 'app' // 等价于 $mound('app')
}).$mount('#app')