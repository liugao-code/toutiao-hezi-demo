<template>
  <div class="image-container">
    <!-- 卡片 -->
    <el-card>
      <div slot="header" class="clearfix">
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
          <el-breadcrumb-item>素材管理</el-breadcrumb-item>
        </el-breadcrumb>
        <el-button style="float: right; padding: 3px 0" type="text"
          >上传素材</el-button
        >
      </div>
      <div style="padding-bottom:20px">
        <el-radio-group v-model="collect" size="mini" @change="onCollectChange">
          <el-radio-button label="false">全部</el-radio-button>
          <el-radio-button label="true">收藏</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 图片列表 -->
      <el-row :gutter="10">
        <el-col
          :xs="12"
          :sm="6"
          :md="6"
          :lg="4"
          v-for="(item, index) in images"
          :key="index"
        >
          <el-image style="height: 100px" :src="item.url"></el-image>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import { getImages } from '@/api/image'
export default {
  name: 'ImageIndex',
  data() {
    return {
      collect: false, // 默认查询是全部
      images: [] // 图片素材列表
    }
  },
  components: {},
  props: {},
  created() {
    this.loadImages(false)
  },
  methods: {
    async loadImages(collect = false) {
      const { data: res } = await getImages({ collect: false })
      this.images = res.data.results
    },
    // 按钮组件默认有一个 change事件,可以拿到里面的label值, 通过label值来修改状态 发送请求 获取对应的图片数据
    onCollectChange(value) {
      this.loadImages(value)
    }
  }
}
</script>

<style lang="less" scoped></style>
