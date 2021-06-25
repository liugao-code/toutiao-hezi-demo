<template>
  <div>
    <el-card class="filter-card">
      <!-- 面包屑路径导航 -->
      <div slot="header" class="clearfix">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
          <el-breadcrumb-item>内容管理</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <!-- 数据筛选表单 -->
      <el-form ref="form" :model="form" label-width="40px" size="mini">
        <el-form-item label="状态">
          <el-radio-group v-model="status">
            <!-- er-radio 默认把 label 作为文本和选中之后的 value 值-->
            <el-radio :label="null">全部</el-radio>
            <el-radio :label="0">草稿</el-radio>
            <el-radio :label="1">待审核</el-radio>
            <el-radio :label="2">审核通过</el-radio>
            <el-radio :label="3">审核失败</el-radio>
            <el-radio :label="4">已删除</el-radio>
          </el-radio-group>
        </el-form-item>
        <!-- 频道数据查询 -->
        <el-form-item label="频道">
          <!--这里的 v-model 绑定的值对应的是 :value 的值 -->
          <el-select v-model="channelId" placeholder="请选择活动区域">
            <el-option label="全部" :value="null"></el-option>
            <el-option
              :label="item.name"
              :value="item.id"
              v-for="(item, index) in channels"
              :key="index"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="日期">
          <!-- value-format 可选，绑定值的格式。不指定则绑定值为 Date 对象 -->
          <!-- format  显示在输入框中的格式 -->
          <el-date-picker
            v-model="rangeDate"
            type="datetimerange"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="['12:00:00']"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <!-- button 按钮的 click 事件有个默认参数 当你没有指定参数的时候,他会默认传递一个没用的数据 -->
          <el-button type="primary" :disabled="loading" @click="loadArticles(1)"
            >查询</el-button
          >
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="box-card">
      <div slot="header" class="clearfix">
        根据筛选条件共查询{{ totalCount }}到条结果：
      </div>
      <!-- 数据列表 -->
      <!--
        Table 表格组件
        1、把需要展示的数组列表数据绑定给 table 组件的 data 属性
          注意：你不用去 v-for 遍历，它自己会遍历
        2、设计表格列 el-table-column
          width 可以设定表格列的宽度
          label 可以设定列的标题
          prop  用来设定要渲染的列表项数据字段，只能展示文本

        3、表格列默认只能渲染普通文本，如果需要展示其它内容，例如放个按钮啊、放个图片啊，那就需要自定义表格列模板了
       -->
      <template>
        <el-table
          :data="articles"
          stripe
          style="width: 100%"
          class="list-tabel"
          size="mini"
          v-loading="loading"
        >
          <el-table-column prop="date" label="封面">
            <template slot-scope="scope">
              <!-- 因为后台数据有的没有图片,所以这里做了判断,后台有图片就渲染没有就用自己设置默认的图片 -->
              <!-- <img
                v-if="scope.row.cover.images[0]"
                :src="scope.row.cover.images[0]"
                class="article-cover"
              /> -->
              <!-- <img v-else src="./no-cover.gif" alt="" class="article-cover" /> -->
              <!-- el-image 的用法 -->
              <el-image
                style="width: 50px; height: 50px;"
                :src="scope.row.cover.images[0]"
                fit="cover"
              ></el-image>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="标题"> </el-table-column>
          <el-table-column label="状态">
            <!-- 如果需要在自定义列模板中获取当前遍历项数据，那么就在 template 上声明 slot-scope="scope" -->
            <template slot-scope="scope">
              <el-tag
                type="warning"
                :type="articleStatus[scope.row.status].type"
                >{{ articleStatus[scope.row.status].text }}</el-tag
              >
              <!-- ## 下面的写法很麻烦,所以就定义了一个数组来管理这些数据 -->
              <!-- <el-tag v-if="scope.row.status === 0" type="warning">草稿</el-tag>
            <el-tag v-else-if="scope.row.status === 1">待审核</el-tag>
            <el-tag v-else-if="scope.row.status === 2" type="success">审核通过</el-tag>
            <el-tag v-else-if="scope.row.status === 3" type="danger">审核失败</el-tag>
            <el-tag v-else-if="scope.row.status === 4" type="info">已删除</el-tag> -->
            </template>
          </el-table-column>
          <el-table-column prop="pubdate" label="发布时间"> </el-table-column>
          <el-table-column label="操作">
            <!-- 如果需要在自定义列模板中获取当前遍历项数据，那么就在 template 上声明 slot-scope="scope" -->
            <template slot-scope="scope">
              <el-button
                icon="el-icon-edit"
                type="primary"
                size="mini"
                circle
                @click="$router.push('/publish?id=' + scope.row.id.toString())"
              ></el-button>
              <el-button
                size="mini"
                type="danger"
                icon="el-icon-delete"
                circle
                @click="onDeleteArucle(scope.row.id)"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <!-- 列表分页 -->
      <!--
        total 用来设定总数据的条数
        它默认按照 10 条每页计算总页码
        page-size 每页显示条目个数，支持 .sync 修饰符，默认每页 10 条
        90 3 90 / 3 = 30
        分页组件中设定的每页数据大小应该和我们请求数据的每页大小保持一致,否则页码的计算就会有问题
       -->
      <!-- :disabled="loading" 就是loading为false 就是禁用状态因为这两个属性的值都是boolean , laoding为true,  disabled 就是禁用状态  
      @current-change="onCurrentChange"  这个可以拿到点击后对应的页码数 是el-pagination 的方法
      -->
      <el-pagination
        layout="prev, pager, next"
        background
        :total="totalCount"
        @current-change="onCurrentChange"
        :page-size="pageSize"
        :disabled="loading"
        :current-page.sync="page"
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
import { getArticles, getArticlesChannels, deleteArticle } from '@/api/article'
export default {
  name: 'ArticleIndex',
  data() {
    return {
      form: {
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
      },
      page: 1, // 当前页码
      totalCount: 0, // 总数据条数
      pageSize: 10, // 每页大小
      status: null, // 查询文章的状态，不传就是全部
      articles: [], // 文章数据列表
      articleStatus: [
        { status: 0, text: '草稿', type: 'info' }, // 0
        { status: 1, text: '待审核', type: '' }, // 1
        { status: 2, text: '审核通过', type: 'success' }, // 2
        { status: 3, text: '审核失败', type: 'warning' }, // 3
        { status: 4, text: '已删除', type: 'danger' } // 4
      ],
      channels: [], // 查询文章的列表
      channelId: null, // 查询文章的频道
      rangeDate: null, // 筛选的范围日期
      loading: false // 表单数据加载中 loading
    }
  },
  components: {},
  props: {},
  created() {
    // 页面初始化,默认加载第一页,这里的传入多少就是第几页
    this.loadArticles(1)
    this.loadChannels()
  },

  methods: {
    onSubmit() {
      // console.log('submit!')
    },
    // 默认 page 当前页面数为 1
    async loadArticles(page = 1) {
      // 请求加载开启 loading
      this.loading = true
      const { data: res } = await getArticles({
        // page:page,
        page, // es6语法糖 写法 键和值相同就可以简写
        per_page: this.pageSize,
        status: this.status,
        // status: null, // axios 不会发送 数据为 null undefined 之类的数据
        channel_id: this.channelId,
        begin_pubdate: this.rangeDate ? this.rangeDate[0] : null, // 开始日期
        end_pubdate: this.rangeDate ? this.rangeDate[1] : null // 结束日期
      })
      // console.log(res)
      this.articles = res.data.results // 数据的列表
      this.totalCount = res.data.total_count // 数量总的条数

      // 关闭加载loading
      this.loading = false
    },
    // 这个方法可以拿到对应的页码数
    onCurrentChange(page) {
      this.loadArticles(page)
    },
    async loadChannels() {
      const res = await getArticlesChannels()
      // console.log(res)
      this.channels = res.data.data.channels
    },
    async onDeleteArucle(id) {
      console.log(id.toString())
      this.$confirm('确认删除吗？', '删除提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          // 确认执行这里
          deleteArticle(id.toString()).then(res => {
            // 删除成功，更新当前页的文章数据列表
            this.loadArticles(this.page)
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    }
  }
}
</script>

<style lang="less" scoped>
.filter-card {
  margin-bottom: 30px;
}

.list-tabel {
  margin-bottom: 20px;
}

.article-cover {
  width: 60px;
  background-size: cover;
}
</style>
