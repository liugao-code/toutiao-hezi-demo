<template>
  <div>
    <!-- 卡片视图 -->
    <el-card>
      <div slot="header" class="clearfix">
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
          <el-breadcrumb-item>个人管理</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <el-row>
        <el-col :span="10">
          <el-form ref="form" :rules="rules" :model="user" label-width="80px">
            <el-form-item label="编号"> {{ user.id }}</el-form-item>
            <el-form-item label="手机"> {{ user.mobile }}</el-form-item>
            <el-form-item label="邮箱">
              {{ user.email }}
            </el-form-item>
            <el-form-item label="媒体名称" prop="name">
              <el-input v-model="user.name"></el-input>
            </el-form-item>
            <el-form-item label="媒体介绍" prop="intro">
              <el-input type="textarea" v-model="user.intro"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                @click="onUpdateUser"
                :loading="updateProfileLoading"
                >保存设置</el-button
              >
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="4" :offset="2">
          <label for="file">
            <el-avatar
              shape="square"
              :size="150"
              fit="cover"
              :src="user.photo"
            ></el-avatar>
            <p>点击修改头像</p>
          </label>

          <input
            id="file"
            type="file"
            ref="file"
            hidden
            @change="onFileChange"
          />
        </el-col>
      </el-row>
    </el-card>
    <!-- 修改头像对话框视图 -->
    <el-dialog
      title="修改头像"
      :visible.sync="dialogVisible"
      append-to-body
      @opened="onDialogOpened"
      @closed="onDialogClosed"
    >
      <div class="preview-image-wrap">
        <img :src="previewImage" ref="preview-image" class="preview-image" />
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="onUpdatePhoto"
          :laoding="updatePhotoLoading"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getUserProfile, updateUserPhoto, updateUserProfile } from '@/api/user'
import 'cropperjs/dist/cropper.css'
import Cropper from 'cropperjs'
import { _globalBus } from '@/utils/global-bus'
export default {
  name: 'SettingsIndex',
  data() {
    return {
      user: {
        email: '',
        id: null,
        untro: '',
        mobile: '',
        name: '',
        photo: ''
      }, // 用户资料
      rules: {
        name: [
          { required: true, message: '请输入媒体名称', trigger: 'blur' },
          { min: 1, max: 7, message: '长度在 1 到 7 个字符', trigger: 'blur' }
        ],
        intro: [{ required: true, message: '请填写媒体介绍', trigger: 'blur' }]
      },
      dialogVisible: false, // 控制对话框的显示与隐藏
      previewImage: '', // 预览图片
      cropper: null, // 裁切显示
      updatePhotoLoading: false, // 更新用户头像 loading 状态
      updateProfileLoading: false // 更新基本信息的 loading 状态
    }
  },
  components: {},
  props: {},
  created() {
    this.laodUser()
  },

  methods: {
    async onUpdateUser() {
      this.updateProfileLoading = true
      const { name, intro, email } = this.user
      await updateUserProfile({
        name,
        intro,
        email
      })
      this.$message.success('保存成功!')
      // 关闭 loading 状态
      this.updateProfileLoading = false
    },

    async laodUser() {
      const { data: res } = await getUserProfile()
      this.user = res.data
    },
    onFileChange() {
      // 处于图片预览
      const file = this.$refs.file
      // 拿到上传图片的地址
      // !# window.URL.createObjectURL 这个是原生的 方法
      const blobData = window.URL.createObjectURL(file.files[0])
      this.previewImage = blobData
      // 展示弹出层
      this.dialogVisible = true

      // 解决选择相同文件不触发 change 事件问题
      this.$refs.file.value = ''
    },
    onDialogOpened() {
      // 图片裁切器必须基于 img 进行初始化
      // 注意: img 必须是可见状态才能正常完成初始化
      //       因为我们这里要在对话框里面初始化裁切器
      //       所以务必要在对话框完全打开的状态去进行初始化。
      // 获取图片 DOM 节点
      const image = this.$refs['preview-image']

      // 第1次初始化好以后，如果预览裁切的图片发生了变化，裁切器默认不会更新
      // 如果需要预览图片发生变化更新裁切器：
      //    方式一：裁切器.replace 方法
      //    方式二：销毁裁切器，重新初始化
      // 初始化裁切器
      // if (this.cropper) {
      //   this.cropper.replace(this.previewImage)
      //   return
      // }
      this.cropper = new Cropper(image, {
        viewMode: 1, // 限制裁剪框不超过画布的大小
        // 定义裁剪器的拖动模式
        dragMode: 'none',
        // 定义裁切框的固定宽高比。默认情况下，裁切框有一个空闲比率 16 / 9
        aspectRatio: 1,
        // 允许通过拖动调整裁剪框的大小。
        cropBoxResizable: false // false 禁止拖动
      })
    },
    onDialogClosed() {
      // 对话框关闭,销毁裁切器
      this.cropper.destroy()
    },
    onUpdatePhoto() {
      // 让确定按钮开始 loading
      this.updatePhotoLoading = true
      // 获取裁切的图片对象
      this.cropper.getCroppedCanvas().toBlob(file => {
        const fd = new FormData()
        fd.append('photo', file)
        // 请求更新用户头像请求提交 fd
        updateUserPhoto(fd).then(res => {
          // 关闭对话框
          this.dialogVisible = false
          // 更新视图展示

          // 直接把裁切结果的文件对象转为 blob 数据本地预览
          this.user.photo = window.URL.createObjectURL(file)

          // 关闭确定按钮的 loading
          this.updatePhotoLoading = false

          this.$message({
            type: 'success',
            message: '更新头像成功'
          })
          // 更新顶部登录用户的信息
          // globalBus.$emit('update-user', this.user)

          // 把服务端返回的图片进行展示有点慢
          // this.user.photo = res.data.data.photo
        })
      })
      // 请求更新用户头像
      // 关闭对话框
      // 更新视图展示
    }
  }
}
</script>

<style lang="less" scoped>
.preview-image-wrap {
  .preview-image {
    display: block;

    max-width: 100%;
    height: 200px;
  }
}
</style>
