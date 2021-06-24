<template>
  <el-container class="layout-container">
    <el-aside class="aside" width="auto ">
      <app-aside class="aside-menu" :is-collapse="isCollapse" />
      <!-- 侧边栏组件 -->
    </el-aside>
    <el-container>
      <el-header class="header">
        <i
          :class="{
            'el-icon-s-fold': isCollapse,
            'el-icon-s-unfold': !isCollapse
          }"
          @click="isCollapse = !isCollapse"
        ></i>
        <h1>夜空中最亮的星</h1>
        <el-dropdown>
          <div class="avatar-wrap">
            <img class="avatar" :src="user.photo" /><span>{{ user.name }}</span>
            <i class="el-icon-arrow-down el-icon--right"></i>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>设置</el-dropdown-item>
            <!-- 组件默认是不识别原生事件的，除非内部做了处理 -->
            <el-dropdown-item @click.native="onLogout">退出</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-header>
      <el-main class="main">
        <!-- 子路由出口 -->
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import AppAside from './components/aside.vue'
import { getUserProfile } from '@/api/user'
export default {
  name: 'LayoutIndex',
  data() {
    return {
      user: {}, // 当前登录信息
      isCollapse: false
    }
  },
  components: {
    AppAside
  },
  props: {},
  created() {
    // 组件初始化好,请求获取用户资料
    this.loadUserProfile()
  },

  methods: {
    // 除了登录接口，其它所有接口都需要授权才能请求使用
    // 或者说，除了登录接口，其它接口都需要提供你的身份令牌才能获取数据
    loadUserProfile() {
      getUserProfile().then(res => {
        console.log(res)
        this.user = res.data.data
      })
    },
    onLogout() {
      this.$confirm('确认退出吗?' , '退出提示', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          // console.log(13);
          // 把用户的登录状态清除
          window.localStorage.removeItem('user')
          // 跳转到登录页面
          this.$router.push('/login')
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消退出'
          })
        })
    }
  }
}
</script>

<style lang="less" scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ccc;
  height: 60px;
}

.main {
  background-color: #e9eef3;
}

.aside {
  background-color: #d3dce6;
}

.layout-container {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}
.avatar-wrap {
  display: flex;
  align-items: center;
  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 10px;
  }
}
</style>
