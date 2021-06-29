<template>
  <div class="image-container">
    <!-- 卡片 -->
    <el-card el-card>
      <div slot="header" class="clearfix">
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
          <el-breadcrumb-item>素材管理</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <!-- 图片列表 -->
      <image-list />
    </el-card>
  </div>
</template>

<script>
import ImageList from './components/images-list.vue'
export default {
  name: 'ImageIndex',
  data() {
    return {}
  },
  components: {
    ImageList
  },
  props: {},
  created() {},
  methods: {}
}
</script>

<style lang="less" scoped></style>
