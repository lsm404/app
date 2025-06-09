// API配置
const API_BASE_URL = 'http://127.0.0.1:8088';

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

// 获取工具列表
function getTools() {
  return request({
    url: '/api/tools',
    method: 'GET'
  });
}

// 按分类获取工具列表
function getToolsByCategory(category = 0) {
  return request({
    url: `/api/tools?category=${category}`,
    method: 'GET'
  });
}

module.exports = {
  request,
  getTools,
  getToolsByCategory
}; 