<template>
  <div class="publish-container">
    <!-- 卡片 -->
    <el-card class="box-card">
      <!-- 面包屑导航 -->
      <div slot="header" class="clearfix">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
          <el-breadcrumb-item>{{
            $route.query.id ? '修改文章' : '发布文章'
          }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <!-- form 表单控件 -->
      <el-form
        ref="publish-form"
        :model="article"
        label-width="60px"
        :rules="formRules"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="article.title"></el-input>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <!-- <el-input type="textarea" v-model="article.content"></el-input> -->
          <el-tiptap
            v-model="article.content"
            :extensions="extensions"
            height="350"
            placeholder="请输入文章内容"
            lang="zh"
          ></el-tiptap>
        </el-form-item>
        <el-form-item label="封面">
          <!-- 这里的 v-model="article.cover.type" 可以获取到 el-radio 里面 label的值-->
          <el-radio-group v-model="article.cover.type">
            <el-radio :label="1">单图</el-radio>
            <el-radio :label="3">三图</el-radio>
            <el-radio :label="0">无图</el-radio>
            <el-radio :label="-1">自动</el-radio>
          </el-radio-group>
          <!--
            我们需要把选择的封面图片的地址放到 article.cover.images 数组中
            当你给事件处理函数传递了自定义参数以后，就无法得到原本的那个数据参数了。
            如果想要在事件处理函数自定义传参以后还想得到原来的那个事件本身的参数，则手动指定 $event，它就代表那个事件本身的参数
            在组件上使用 v-model
            当你给子组件提供的数据既要使用还要修改，这个时候我们可以使用 v-model 简化数据绑定。
            v-model="article.cover.images[index]"
              给子组件传递了一个名字叫 value 的数据
              :value="article.cover.images[index]"
              默认监听 input 事件，当事件发生，它会让绑定数据 = 事件参数
              @input="article.cover.images[index] = 事件参数"
            注意：v-model 仅仅是简写了而已，本质还在在父子组件通信
            v-model 的参考文档：https://cn.vuejs.org/v2/guide/components-custom-events.html#%E8%87%AA%E5%AE%9A%E4%B9%89%E7%BB%84%E4%BB%B6%E7%9A%84-v-model
           -->
          <!-- article.cover.type > 0 判断上面的 label 大于0的就进行渲染出来 -->
          <template v-if="article.cover.type > 0">
            <upload-cover
              v-for="(cover, index) in article.cover.type"
              :key="index"
              v-model="article.cover.images[index]"
            />
            <!-- <upload-cover
              v-for="(cover, index) in article.cover.type"
              :key="index"
              @update-cover="onUpdateCover(index, $event)"
              :update-image="article.cover.images[index]"
            /> -->
          </template>
        </el-form-item>
        <el-form-item label="频道" prop="channel_id">
          <!--这里的 v-model 绑定的值对应的是 :value 的值 -->
          <el-select v-model="article.channel_id" placeholder="请选择活动区域">
            <el-option
              :label="item.name"
              :value="item.id"
              v-for="(item, index) in channels"
              :key="index"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onPublish(false)">发表</el-button>
          <el-button @click="onPublish(true)">存入草稿</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import {
  getArticlesChannels,
  addArticle,
  getArticle,
  updateArticle
} from '@/api/article'
// 导入富文本编辑器
import {
  ElementTiptap,
  Doc,
  Text,
  Paragraph,
  Heading,
  Bold,
  Underline,
  Italic,
  Image,
  Strike,
  ListItem,
  BulletList,
  OrderedList,
  TodoItem,
  TodoList,
  HorizontalRule,
  Fullscreen,
  Preview,
  CodeBlock,
  TextColor
} from 'element-tiptap'
import 'element-tiptap/lib/index.css'
import { uploadImage } from '@/api/image'
import UploadCover from './components/upload-cover.vue'
export default {
  name: 'PublishIndex',
  data() {
    return {
      channels: [], // 查询文章的频道
      article: {
        title: '', // 文章标题
        content: '', // 文章内容
        cover: {
          // 封面
          type: 0, // 封面的类型  -1:自动,0-无图,1-1张,3-3张
          images: [] // 封面图片的地址
        },
        channel_id: null //
      },
      // 编辑器的 extensions
      // 它们将会按照你声明的顺序被添加到菜单栏和气泡菜单中
      extensions: [
        new Doc(),
        new Text(),
        new Paragraph(),
        new Heading({ level: 3 }),
        new Bold({ bubble: true }),
        // 在气泡菜单中渲染菜单按钮
        new Image({
          // 默认会把图片生成 base64 字符串和内容存储在一起 自定义图片上传
          // 图片的上传方法,返回一个 promise<url>
          // uploadRequest 这个方法是这个插件内置的方法, file 是默认携带的参数,可以拿到上传图片的路径
          async uploadRequest(file) {
            const fd = new FormData()
            fd.append('image', file)
            const { data: res } = await uploadImage(fd)
            // 这个方法必须 返回最后的结果
            return res.data.url
          }
        }),
        new Underline(), // 下划线
        new Italic(), // 斜体
        new Strike(), // 删除线
        new HorizontalRule(), // 华丽的分割线
        new ListItem(), // 配合下面两个一起使用
        new BulletList(), // 无序列表
        new OrderedList(), // 有序列表
        new TodoItem(),
        new TodoList(), // 任务列表 , 要和TodoItem一起使用
        new Fullscreen(), // 全屏模式
        new Preview(), // 预览
        new CodeBlock(), // 代码块
        new TextColor() // 颜色设置
      ],
      formRules: {
        title: [
          { required: true, message: '请输入文章标题', trigger: 'blur' },
          { min: 5, max: 30, message: '长度在 5 到 30 个字符', trigger: 'blur' }
        ],
        content: [
          // { required: true, message: '请输入文章内容', trigger: 'change' }
          // 富文本框只有自己定义规则
          // 富文本框输入内容后有删除了,但文本框中会有标签存在,所以判断标签没有内容就提示输入内容
          {
            validatePass(rule, value, callback) {
              if (value === '<p></p>') {
                // 验证失败
                callback(new Error('请输入文章内容'))
              } else {
                // 验证通过
                callback()
              }
            }
          },
          { required: true, message: '请输入文章内容', trigger: 'blur' }
        ],
        channel_id: [{ required: true, message: '请选择文章频道' }]
      }
    }
  },
  components: {
    // 注册富文本编辑器
    'el-tiptap': ElementTiptap,
    UploadCover
  },
  props: {},
  created() {
    this.loadChannels()

    // 由于我们让发布和修改使用的同一个组件
    // 所以这里要判断
    // 如果路由路径参数中有 id ,则请求展示文章内容
    // 这里的 id 是 内容列表通过路由携带过来的
    if (this.$route.query.id) {
      this.loadArticle()
    }
  },

  methods: {
    async loadChannels() {
      // 发送请求获取文章频道数据
      const { data: res } = await getArticlesChannels()
      this.channels = res.data.channels
    },

    async onPublish(draft = false) {
      this.$refs['publish-form'].validate(valid => {
        // 验证失败,停止提交表单
        if (!valid) {
          return
        }
        // 验证通过,提交表单
        // 找到数据结构
        // 封装请求方法
        // 请求数据提交
        // 如果是修改文章,则执行修改操作,否则执行添加操作
        const id = this.$route.query.id
        if (id) {
          // 执行修改操作
          updateArticle(id, this.article, draft).then(res => {
            this.$message({
              message: `${draft ? '存入草稿' : '发布'}成功`,
              type: 'success'
            })
            // 跳转到内容管理页面
            this.$router.push('/article')
          })
        } else {
          addArticle(this.article, draft).then(res => {
            // 处理响应结果
            this.$message({
              message: `${draft ? '存入草稿' : '发布'}成功`,
              type: 'success'
            })
            // 跳转到内容管理页面
            this.$router.push('/article')
          })
        }
      })
    },

    // 加载文章内容,把要修改的数据显示到修改页面
    async loadArticle() {
      // 找到数据结构
      // 封装请求方法
      // 请求数据提交
      const id = this.$route.query.id
      if (id) {
        const { data: res } = await getArticle(this.$route.query.id)
        // 模板绑定展示
        this.article = res.data
      } else {
        this.loadChannels()
      }
    },

    // onUpdateCover(index, url) {
    //   this.article.cover.images[index] = url
    // }
  }
}
</script>

<style lang="less" scoped></style>
