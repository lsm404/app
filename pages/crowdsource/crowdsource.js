// pages/crowdsource/crowdsource.js
Page({
  data: {
    searchQuery: '',
    projects: [], // 众筹项目列表
    isLoadingMore: false,
    noMoreData: false,
    currentPage: 1,
    pageSize: 10
  },

  onLoad(options) {
    // 页面加载时获取初始项目数据
    this.fetchProjects(true);
  },

  onShow() {
    // 页面显示时，如果需要可以刷新数据
  },

  // 获取项目数据
  fetchProjects(isRefresh = false) {
    if (this.data.isLoadingMore && !isRefresh) return;
    if (this.data.noMoreData && !isRefresh) return;

    this.setData({
      isLoadingMore: true
    });

    if (isRefresh) {
      this.setData({ currentPage: 1, projects: [], noMoreData: false });
    }

    // 模拟API请求
    setTimeout(() => {
      const newProjects = [];
      const startId = (this.data.currentPage - 1) * this.data.pageSize + 1;
      for (let i = 0; i < this.data.pageSize; i++) {
        const projectId = startId + i;
        // 模拟不同数据，避免每次加载都一样
        if (this.data.currentPage > 3 && i > 4 && !this.data.searchQuery) { // 模拟没有更多数据的情况
            break;
        }
        newProjects.push({
          id: projectId,
          name: `众筹项目 ${projectId}` + (this.data.searchQuery ? ` (搜索结果: ${this.data.searchQuery})` : ''),
          description: '这是一个示例众筹项目的描述，旨在展示项目的基本信息和吸引力。',
          imageUrl: `https://picsum.photos/seed/${projectId}/200/200`, // 随机图片
          progress: Math.min(100, 20 + projectId * 5 + Math.floor(Math.random() * 30)),
          goalAmount: '¥10,000',
          currentAmount: `¥${Math.floor((20 + projectId * 5 + Math.floor(Math.random() * 30))/100 * 10000)}`
        });
      }

      this.setData({
        projects: isRefresh ? newProjects : this.data.projects.concat(newProjects),
        isLoadingMore: false,
        currentPage: this.data.currentPage + 1,
        noMoreData: newProjects.length < this.data.pageSize
      });
    }, 1000); // 模拟网络延迟
  },

  // 搜索相关
  onSearchChange(event) {
    this.setData({
      searchQuery: event.detail
    });
  },

  onSearch() {
    // 用户点击软键盘搜索按钮
    console.log('搜索:', this.data.searchQuery);
    this.fetchProjects(true); // 重新加载数据
  },

  onCancelSearch() {
    this.setData({
      searchQuery: ''
    });
    this.fetchProjects(true); // 清空搜索，重新加载数据
  },

  // 跳转到项目详情
  navigateToProjectDetail(event) {
    const projectId = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/projectDetail/projectDetail?id=${projectId}` // 假设有项目详情页
    });
  },

  // 上拉加载更多
  onReachBottom() {
    if (!this.data.isLoadingMore && !this.data.noMoreData) {
      console.log('触发上拉加载更多');
      this.fetchProjects();
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    console.log('触发下拉刷新');
    this.fetchProjects(true).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 加载更多按钮点击 (如果不用onReachBottom，可以用这个)
  loadMoreProjects() {
    this.fetchProjects();
  }
});