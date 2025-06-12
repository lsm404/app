/*
 * @Author: lishengmin shengminfang@foxmail.com
 * @Date: 2025-06-09 10:13:35
 * @LastEditors: lishengmin shengminfang@foxmail.com
 * @LastEditTime: 2025-06-12 10:48:28
 * @FilePath: /applet/app/utils/api.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// API配置
const API_BASE_URL = 'http://120.46.28.146:9001';

// 通用请求方法
function request(options) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      success: (res) => {
        if (res.data.code === 200) {
          resolve(res.data);
        } else {
          reject(res.data);
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

// 获取工具列表（支持分页和筛选）
function getTools(params = {}) {
  const {
    page = 1,
    pageSize = 10,
    category = null,
    title = ''
  } = params;
  
  // 构建查询参数
  let queryParams = `page=${page}&pageSize=${pageSize}`;
  
  // category为0或空时查询全部数据，不传category参数
  if (category !== null && category !== undefined && category !== 0 && category !== '') {
    queryParams += `&category=${category}`;
  }
  
  if (title) {
    queryParams += `&title=${encodeURIComponent(title)}`;
  }
  
  return request({
    url: `/api/tools?${queryParams}`,
    method: 'GET'
  });
}

// 按分类获取工具列表（带分页）
function getToolsByCategory(category = 0, page = 1, pageSize = 10) {
  // category为0时表示查询全部数据
  const params = {
    page: page,
    pageSize: pageSize
  };
  
  // 只有当category不为0时才传递category参数
  if (category !== 0) {
    params.category = category;
  }
  
  return getTools(params);
}

// 搜索工具
function searchTools(keyword, page = 1, pageSize = 10) {
  return getTools({
    title: keyword,
    page: page,
    pageSize: pageSize
  });
}

module.exports = {
  request,
  getTools,
  getToolsByCategory,
  searchTools
}; 