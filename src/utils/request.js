/**
 *  基于 axios 封装的请求模块
 */
import axios from 'axios';
// 创建一个 axios 实例,说白了就是复制一个 axios
// 我们请求通过这个实例去发送请求,把需要的配置个这个实例来
const request = axios.create({
  baseURL: 'http://api-toutiao-web.itheima.net', // 请求的基础路径
})

// 导出请求方法
// 谁要使用谁就加载 request 模块
export default request
