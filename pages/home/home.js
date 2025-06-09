/*
 * @Author: lishengmin shengminfang@foxmail.com
 * @Date: 2025-05-29 15:13:42
 * @LastEditors: lishengmin shengminfang@foxmail.com
 * @LastEditTime: 2025-06-09 14:36:07
 * @FilePath: /app/pages/home/home.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

// 引入API工具
const api = require('../../utils/api.js');

Page({
  data: {
    currentTab: 0, // 当前选中的标签
    tools: [], // 改为空数组，将从API获取数据
    loading: true, // 添加加载状态
    showCustomModal: false,
    modalData: {
      title: '',
      subtitle: '',
      link: ''
    },
  },

  // 切换标签
  switchTab(e) {
    const index = e.currentTarget.dataset.index;
    const tabNames = ['近期更新', '实用软件', '影视音乐', '万能资料'];
    
    this.setData({
      currentTab: index
    });
    
    // 根据tab索引获取对应分类的工具
    // index: 0-近期更新(全部), 1-实用软件, 2-影视音乐, 3-漫画小说
    this.getToolsData(index);
    console.log('切换到标签:', tabNames[index], '分类:', index);
  },

  // 复制链接
  copyLink(link) {
    console.log('123', link)
    wx.setClipboardData({
      data: link,
      success() {
        wx.showToast({ title: '链接已复制', icon: 'success' });
      }
    });
  },

  // 查看工具详情
  viewDetail(e) {
    const id = e.currentTarget.dataset.id;
    const tool = this.data.tools.find(item => item.id === id);
    console.log(tool)
    const that = this;
    wx.showModal({
      title: '下载地址（夸克）',
      content: 'https://example.com/download',
      confirmText: '复制',
      cancelText: '取消',
      success(res) {
        if (res.confirm) {
          that.copyLink(tool.link);
        }
      }
    });
  },
  
  // 隐藏弹窗
  hideModal() {
    this.setData({ showCustomModal: false });
  },
  
  // 防止冒泡
  preventBubble() {},

  // 获取工具列表数据（支持分类筛选）
  async getToolsData(category = 0) {
    try {
      wx.showLoading({
        title: '加载中...',
        mask: true
      });

      const res = await api.getToolsByCategory(category);
      console.log('API响应:', res, '分类:', category);
      
      this.setData({
        tools: res.data || [],
        loading: false
      });

      wx.hideLoading();
    } catch (error) {
      console.error('获取工具列表失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      
      this.setData({
        loading: false
      });
    }
  },
  
  // 页面加载
  onLoad() {
    // 调用API获取数据
    this.getToolsData();
  }
});