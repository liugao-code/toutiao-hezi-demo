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
      </div>
      <div class="action-head">
        <el-radio-group v-model="collect" size="mini" @change="loadImages(1)">
          <el-radio-button label="false">全部</el-radio-button>
          <el-radio-button label="true">收藏</el-radio-button>
        </el-radio-group>
        <el-button
          size="mini"
          type="success"
          @click="dialogUploadVisible = true"
          >上传素材</el-button
        >
      </div>

      <!-- 图片列表 -->
      <el-row :gutter="10">
        <el-col
          class="image-item"
          :xs="12"
          :sm="6"
          :md="6"
          :lg="4"
          v-for="(img, index) in images"
          :key="index"
        >
          <el-image style="height: 100px" :src="img.url" fil="cover"></el-image>
          <div class="image-action">
            <!--
            class 样式绑定
             {
                CSS类名: 布尔值
             }
             true：作用类名
             false：不作用类名
           -->
            <el-button
              type="warning"
              :icon="img.is_collected ? 'el-icon-star-on' : 'el-icon-star-off'"
              circle
              size="small"
              @click="onCollect(img)"
              :loading="img.loading"
            ></el-button>
            <el-button
              circle
              type="danger"
              size="mini"
              class="el-icon-delete-solid"
              @click="onDelete(img)"
              :loading="img.loading"
            ></el-button>
          </div>
        </el-col>
      </el-row>

      <!-- 数据分页 -->
      <el-pagination
        layout="prev, pager, next"
        background
        :page-size="pageSize"
        :current-page.sync="page"
        :total="totalCount"
        @current-change="loadImages(page)"
      >
      </el-pagination>
    </el-card>

    <!-- 上传对话框 -->
    <el-dialog
      title="上传素材"
      :visible.sync="dialogUploadVisible"
      :modal-append-to-body="false"
    >
      <!-- upload 组件本身就支持请求提交上传操作,组件内部封装好了请求 
    请求方法: 默认是 POST 请求
    请求路径: action , 必须写完整路径
    请求头: headers
    -->
      <el-upload
        :show-file-list="false"
        class="upload-demo"
        drag
        action="http://api-toutiao-web.itheima.net/mp/v1_0/user/iamges"
        multiple
        :headers="uploadHeaders"
        name="image"
        :on-success="onUploadSuccess"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip" slot="tip">
          只能上传jpg/png文件，且不超过500kb
        </div>
      </el-upload>
    </el-dialog>
  </div>
</template>

<script>
import { getImages, collectImages, deleteImages } from '@/api/image'
export default {
  name: 'ImageIndex',
  data() {
    const user = JSON.parse(window.localStorage.getItem('user'))
    return {
      collect: false, // 默认查询是全部
      images: [], // 图片素材列表
      dialogUploadVisible: false,
      uploadHeaders: {
        Authorization: `Bearer ${user.token}`
      },
      pageSize: 30, // 每页数据条数
      page: 1, // 当前页码
      totalCount: 0 // 总数据条数
    }
  },
  components: {},
  props: {},
  created() {
    // 页面初始化加载第一页
    this.loadImages(1)
  },
  methods: {
    // 有默认值的参数放到最后
    async loadImages(page) {
      // 在全部和收藏之间切换时,每次切换都切换到第一页
      // 重置高亮页码, 防止数据和页码不对应
      this.page = page
      const { data: res } = await getImages({
        collect: this.collect,
        page, // es6语法糖 写法 键和值相同就可以简写
        per_page: this.pageSize
      })
      console.log(res)
      const results = res.data.results
      results.forEach(img => {
        // img 对象本来没有 loading 数据, 我们需要手动添加 loading 状态
        // 我们这里收到的往里面添加该数据是用来控制每个收藏按钮的 loading 状态
        img.loading = false
      })
      this.images = res.data.results
      this.totalCount = res.data.total_count
    },
    // 文件上传弹出框
    onUploadSuccess() {
      // 关闭弹出框
      this.dialogUploadVisible = false
      // 更新页面图片
      this.loadImages(this.page)
      this.$message({
        type: 'success',
        message: '上传成功'
      })
    },
    // 根据图片 id 修改图片的状态
    async onCollect(img) {
      // 展示 loading
      img.loading = true
      const { data: res } = await collectImages(img.id, !img.is_collected)
      // 更新视图状态
      img.is_collected = !img.is_collected
      // 关闭 loading
      img.loading = false

      // if (img.is_collected) {
      // 已收藏,取消收藏
      // console.log(img);
      //   const { data: res } = await collectImages(img.id, img.is_collected)
      // console.log(res)
      //   this.$message({
      //     type: 'success',
      //     message: '收藏成功'
      //   })
      // } else {
      // 没有收藏,添加收藏
      // }
    },
    // 根据 图片id 删除对应的数据
    async onDelete(img) {
      const { data: res } = await deleteImages(img.id)
      console.log(res)
      this.$message({
        type: 'success',
        message: '删除成功'
      })
      // 更新图片列表
      this.loadImages(this.page)
    }
  }
}
</script>

<style lang="less" scoped>
.action-head {
  padding-bottom: 20px;
  display: flex;
  justify-content: space-between;
}
.image-item {
  position: relative;
}

.image-action {
  font-size: 25px;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  color: #fff;
  height: 40px;
  background-color: rgba(204, 204, 204, 0.5);
  position: absolute;
  bottom: 4px;
  left: 5px;
  right: 5px;
}

.selected {
  background: url() no-repeat;
  background-size: cover;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
