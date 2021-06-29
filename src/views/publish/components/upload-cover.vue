<template>
  <div class="upload-cover" @click="showCoverSelect">
    <div class="cover-wrap">
      <!-- <img ref="cover-image" class="cover-image" :src="updateImage" /> -->
      <img ref="cover-image" class="cover-image" :src="value" />
    </div>
    <el-dialog
      title="选择封面"
      :visible.sync="dialogVisible"
      width="30%"
      append-to-body
    >
      <el-tabs v-model="activeName" type="card">
        <el-tab-pane label="素材库" name="first">
          <image-list
            :is-show-add="false"
            :is-show-action="false"
            is-show-selected
            ref="image-list"
          />
        </el-tab-pane>
        <el-tab-pane label="上传图片" name="second" class="cover-flex">
          <input type="file" @change="onFileChange" ref="file" />
          <img ref="preview-image" width="180px" />
        </el-tab-pane>
      </el-tabs>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="onCoverConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { uploadImage } from '@/api/image'
import ImageList from '@/views/image/components/images-list'
export default {
  name: 'UploadCover',
  components: { ImageList },
  data() {
    return {
      dialogVisible: false,
      activeName: 'second'
    }
  },
  // props: ['update-image'],
  props: ['value'],
  computed: {},
  watch: {},
  created() {},
  methods: {
    showCoverSelect() {
      this.dialogVisible = true
    },
    onFileChange() {
      // 获取文件对象
      const file = this.$refs.file.files[0]
      // 图片预览
      const blob = window.URL.createObjectURL(file)
      this.$refs['preview-image'].src = blob

      // 防止用户选中同一个文件不触发 change 事件
      // !!!  这里会影响下面的判断 下面的 files[0] 是 undefined
      // this.$refs.file.value = ''
    },
    async onCoverConfirm() {
      if (this.activeName === 'second') {
        const file = this.$refs.file.files[0]
        if (!file) {
          this.$message('请选择文件!')
          return
        }
        const fd = new FormData()
        fd.append('image', file)
        const { data: res } = await uploadImage(fd)
        // 关闭弹出层
        this.dialogVisible = false
        // 展示上传的图片
        this.$refs['cover-image'].src = res.data.url
        // 将图片地址发送个父组件
        // this.$emit('update-cover', res.data.url)
        this.$emit('input', res.data.url)
      } else if (this.activeName === 'first') {
        // 拿到选中图片的对应的索引号
        const imageList = this.$refs['image-list']
        const selected = imageList.selected
        if (selected === null) {
          this.$message('请选择封面图片!')
          return
        }
        // 关闭对话框
        this.dialogVisible = false
        // 修改父组件绑定数据
        // 父组件直接绑定的 v-model 可以直接接收这里的信息
        this.$emit('input', imageList.images[selected].url)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.cover-wrap {
  max-width: 150px;
  height: 120px;
  border: 1px solid #ccc;
  .cover-image {
    height: 120px;
    max-width: 100%;
  }
}
.cover-flex {
  display: flex;
  flex-direction: column;
}
</style>
