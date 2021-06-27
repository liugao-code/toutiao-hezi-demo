<template>
  <div class="container">
    <!-- 卡片视图 -->
    <el-card>
      <div slot="header" class="clearfix">
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
          <el-breadcrumb-item>评论管理</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <!-- 表格视图 -->
      <template>
        <el-table :data="tableData" style="width: 100%" stripe>
          <el-table-column prop="title" label="标题"> </el-table-column>
          <el-table-column prop="total_comment_count" label="总评论数">
          </el-table-column>
          <el-table-column prop="fans_comment_count" label="粉丝评论数">
          </el-table-column>
          <el-table-column prop="comment_status" label="评论状态">
            <template slot-scope="scope">
              {{ scope.row.comment_status ? '正常' : '关闭' }}
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.comment_status"
                active-color="#13ce66"
                inactive-color="#ff4949"
                @change="onStatusChange(scope.row)"
                :disabled="scope.row.statusDisabled"
              >
              </el-switch>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <!-- 分页视图 -->
      <!--  current-page 控制激活的页码,初始肯定是第一页
            page-sizes 控制可选的每页数量
            current-change 可以拿到 page 页码
            current-page.sync 可以双向绑定  必须加 .sync 修饰符
       -->
      <el-pagination
        layout="total, sizes, prev, pager, next, jumper"
        background
        :page-size.sync="pageSize"
        :current-page.sync="page"
        :total="totalCount"
        :page-sizes="[10, 15, 20, 30]"
        @size-change="handleSizeChange"
        @current-change="laodComment(page)"
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
import { getArticles, updateCommentStatus } from '@/api/article'
export default {
  name: 'commentIndex',
  components: {},
  data() {
    return {
      tableData: [], //
      page: 1, // 当前激活的页码数
      pageSize: 10, // 每页显示的数据条数
      totalCount: 0 // 数据的总条数
    }
  },
  props: {},
  computed: {},
  watch: {},
  created() {
    this.laodComment()
  },
  methods: {
    handleSizeChange() {
      this.laodComment(1)
    },

    // 获取到列表的所有数据
    async laodComment(page = 1) {
      this.page = page
      const { data: res } = await getArticles({
        page,
        per_page: this.pageSize,
        response_type: 'comment'
      })
      const results = res.data.results
      results.forEach(row => {
        row.statusDisabled = false
      })
      this.tableData = results

      this.tableData = res.data.results
      this.totalCount = res.data.total_count
    },
    // 根据开关的状态发送请求
    async onStatusChange(row) {
      // 禁用开关
      row.statusDisabled = true
      const { data: res } = await updateCommentStatus(
        row.id.toString(),
        row.comment_status
      )
      // 启用开关
      ;(row.statusDisabled = false),
        this.$message({
          type: 'success',
          message: row.comment_status ? '开启成功' : '关闭成功'
        })
    }
  }
}
</script>

<style lang="less" scoped></style>
