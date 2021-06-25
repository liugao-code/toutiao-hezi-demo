/**
 * 文章相关请求模块
 */
import request from '@/utils/request'

/**
 * 获取文章列表
 */
export const getArticles = params => {
  return request({
    method: 'GET',
    url: '/mp/v1_0/articles',
    // Body 参数使用 data 设置
    // Query 参数使用 params 设置
    // Headers 参数使用 headers 设置
    params
  })
}

/**
 * 获取文章频道
 */
export const getArticlesChannels = () => {
  return request({
    method: 'GET',
    url: '/mp/v1_0/channels',
  })
}

/**
 * 删除文章
 */
export const deleteArticle = id => {
  return request({
    method: 'DELETE',
    url: `/mp/v1_0/articles/${id}`,
  })
}


/**
 * 新建文章
 */
// draft 默认不存为草稿
export const addArticle = (data, draft = false) => {
  return request({
    method: 'POST',
    url: '/mp/v1_0/articles',
    // POST 都是同过 params 传入参数
    params: {
      // 相同名字就可以简写
      // draft: draft
      draft, // 是否存为草稿( true 为草稿)
    },
    data
  })
}

/**
 * 修改文章
 */
export const updateArticle = (id, data, draft = false) => {
  return request({
    method: 'PUT',
    url: `/mp/v1_0/articles/${id}`,
    params: {
      // 相同名字就可以简写
      // draft: draft
      draft, // 是否存为草稿( true 为草稿)
    },
    data
  })
}

/**
 * 获取指定文章
 */
export const getArticle = id => {
  return request({
    method: 'GET',
    url: `/mp/v1_0/articles/${id}`,
  })
}