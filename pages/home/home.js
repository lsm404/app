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
    tools: [], // 工具列表
    loading: false, // 加载状态
    loadingMore: false, // 加载更多状态
    hasMore: true, // 是否还有更多数据
    currentPage: 1, // 当前页码
    pageSize: 10, // 每页数量
    totalCount: 0, // 总数据量
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
      currentTab: index,
      // 重置分页数据
      tools: [],
      currentPage: 1,
      hasMore: true,
      totalCount: 0
    });
    
    // 根据tab索引获取对应分类的工具
    // index: 0-近期更新(全部), 1-实用软件, 2-影视音乐, 3-漫画小说
    this.getToolsData(index, true);
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

  // 获取工具列表数据（支持分类筛选和分页）
  async getToolsData(category = 0, isRefresh = false) {
    try {
      // 防止重复加载
      if (this.data.loading || this.data.loadingMore) {
        return;
      }

      // 如果没有更多数据且不是刷新，直接返回
      if (!this.data.hasMore && !isRefresh) {
        return;
      }

      const currentPage = isRefresh ? 1 : this.data.currentPage;
      const isFirstLoad = currentPage === 1;

      this.setData({
        loading: isFirstLoad,
        loadingMore: !isFirstLoad
      });

      // 首次加载显示loading
      if (isFirstLoad) {
        wx.showLoading({
          title: '加载中...',
          mask: true
        });
      }

      const res = await api.getToolsByCategory(category, currentPage, this.data.pageSize);
      console.log('API响应:', res, '分类:', category, '页码:', currentPage);
      
      const newTools = res.data || [];
      const totalCount = res.count || 0;
      const hasMore = (currentPage * this.data.pageSize) < totalCount;

      // 如果是刷新，替换数据；如果是加载更多，追加数据
      const tools = isRefresh ? newTools : [...this.data.tools, ...newTools];

      this.setData({
        tools: tools,
        currentPage: currentPage + 1,
        totalCount: totalCount,
        hasMore: hasMore,
        loading: false,
        loadingMore: false
      });

      if (isFirstLoad) {
        wx.hideLoading();
      }

      // 如果没有数据，显示提示
      if (tools.length === 0) {
        wx.showToast({
          title: '暂无数据',
          icon: 'none'
        });
      }

    } catch (error) {
      console.error('获取工具列表失败:', error);
      
      this.setData({
        loading: false,
        loadingMore: false
      });

      wx.hideLoading();
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  // 加载更多数据
  loadMoreData() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.getToolsData(this.data.currentTab, false);
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({
      tools: [],
      currentPage: 1,
      hasMore: true,
      totalCount: 0
    });
    
    this.getToolsData(this.data.currentTab, true).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 触底加载更多
  onReachBottom() {
    this.loadMoreData();
  },
  
  // 页面加载
  onLoad() {
    // 调用API获取数据
    this.getToolsData(0, true);
  }
});