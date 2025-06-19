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

// 分类缓存相关配置
const CATEGORIES_CACHE_KEY = 'APP_CATEGORIES_CACHE';
const CATEGORIES_CACHE_TIME = 30 * 60 * 1000; // 缓存30分钟

// 工具列表缓存相关配置
const TOOLS_CACHE_PREFIX = 'APP_TOOLS_CACHE_';
const TOOLS_CACHE_TIME = 5 * 60 * 1000; // 缓存5分钟

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
    categories: [], // 分类列表
    tabsLoading: true, // 分类加载状态
    preloadedCategories: {}, // 已预加载的分类ID
    
    // 搜索相关状态
    searchKeyword: '', // 搜索关键词
    isSearchMode: false, // 是否在搜索模式
    searchResults: [], // 搜索结果
    searchLoading: false, // 搜索加载状态
    
    // 定位相关状态
    targetToolId: null, // 目标工具ID（用于搜索结果定位）
    highlightedToolId: null, // 高亮的工具ID
  },

  // 切换标签
  switchTab(e) {
    const index = e.currentTarget.dataset.index;
    const category = this.data.categories[index] || {};
    const tabName = category.label || '未知';
    const categoryId = category.value || 0;
    
    this.setData({
      currentTab: index,
      // 重置分页数据
      tools: [],
      currentPage: 1,
      hasMore: true,
      totalCount: 0
    });
    
    // 尝试从缓存获取数据
    const cachedTools = this.checkToolsCache(categoryId);
    if (cachedTools) {
      // 从缓存加载
      this.setData({
        tools: cachedTools.data,
        totalCount: cachedTools.count,
        hasMore: (this.data.pageSize < cachedTools.count),
        currentPage: 2 // 已加载第1页，下次加载第2页
      });
      console.log('从缓存加载工具列表:', categoryId, cachedTools);
      
      // 检查是否需要定位到特定工具（从缓存加载时）
      if (this.data.targetToolId) {
        this.locateTargetTool(this.data.targetToolId);
      }
      
      // 预加载其他分类
      this.preloadAdjacentCategories(index);
    } else {
      // 缓存未命中，从API获取
      this.getToolsData(categoryId, true);
      console.log('切换到标签:', tabName, '分类ID:', categoryId);
    }
  },

  // 预加载相邻分类的数据
  preloadAdjacentCategories(currentIndex) {
    // 如果分类数量小于2，不需要预加载
    if (this.data.categories.length < 2) return;
    
    // 计算要预加载的索引
    const preloadIndexes = [];
    
    // 预加载下一个分类
    if (currentIndex < this.data.categories.length - 1) {
      preloadIndexes.push(currentIndex + 1);
    }
    
    // 如果还有空间，预加载上一个分类
    if (currentIndex > 0) {
      preloadIndexes.push(currentIndex - 1);
    }
    
    // 对每个需要预加载的索引进行预加载
    preloadIndexes.forEach(index => {
      const category = this.data.categories[index];
      if (!category) return;
      
      const categoryId = category.value;
      
      // 检查是否已预加载过
      if (this.data.preloadedCategories[categoryId]) {
        return;
      }
      
      // 检查是否已有缓存
      if (this.checkToolsCache(categoryId)) {
        // 已有缓存，标记为已预加载
        const preloaded = { ...this.data.preloadedCategories };
        preloaded[categoryId] = true;
        this.setData({ preloadedCategories: preloaded });
        return;
      }
      
      // 预加载数据（低优先级）
      setTimeout(() => {
        this.preloadCategoryData(categoryId);
      }, 1000); // 延迟1秒预加载，避免阻塞主线程
    });
  },
  
  // 预加载分类数据
  async preloadCategoryData(categoryId) {
    if (!categoryId && categoryId !== 0) return;
    
    try {
      console.log('预加载分类数据:', categoryId);
      const res = await api.getToolsByCategory(categoryId, 1, this.data.pageSize);
      
      if (res && res.code === 200) {
        // 保存到缓存
        this.saveToolsCache(categoryId, res.data || [], res.count || 0);
        
        // 标记为已预加载
        const preloaded = { ...this.data.preloadedCategories };
        preloaded[categoryId] = true;
        this.setData({ preloadedCategories: preloaded });
        
        console.log('分类预加载完成:', categoryId);
      }
    } catch (error) {
      console.error('预加载分类数据失败:', categoryId, error);
    }
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

  // 检查缓存的分类是否有效
  checkCategoriesCache() {
    try {
      // 获取分类缓存
      const cache = wx.getStorageSync(CATEGORIES_CACHE_KEY);
      
      // 如果没有缓存或缓存已过期，返回null
      if (!cache || !cache.timestamp || !cache.data) {
        return null;
      }
      
      // 检查缓存是否过期
      const now = new Date().getTime();
      if ((now - cache.timestamp) > CATEGORIES_CACHE_TIME) {
        return null;
      }
      
      return cache.data;
    } catch (error) {
      console.error('读取分类缓存出错:', error);
      return null;
    }
  },

  // 保存分类数据到缓存
  saveCategoriesCache(data) {
    try {
      const cacheData = {
        timestamp: new Date().getTime(),
        data: data
      };
      
      wx.setStorageSync(CATEGORIES_CACHE_KEY, cacheData);
      console.log('分类数据已缓存');
    } catch (error) {
      console.error('保存分类缓存出错:', error);
    }
  },
  
  // 构建工具列表缓存的key
  getToolsCacheKey(categoryId) {
    return `${TOOLS_CACHE_PREFIX}${categoryId}`;
  },
  
  // 检查工具列表缓存
  checkToolsCache(categoryId) {
    try {
      const cacheKey = this.getToolsCacheKey(categoryId);
      const cache = wx.getStorageSync(cacheKey);
      
      // 如果没有缓存或缓存已过期，返回null
      if (!cache || !cache.timestamp || !cache.data) {
        return null;
      }
      
      // 检查缓存是否过期
      const now = new Date().getTime();
      if ((now - cache.timestamp) > TOOLS_CACHE_TIME) {
        return null;
      }
      
      return {
        data: cache.data,
        count: cache.count
      };
    } catch (error) {
      console.error('读取工具列表缓存出错:', categoryId, error);
      return null;
    }
  },
  
  // 保存工具列表到缓存
  saveToolsCache(categoryId, data, count) {
    try {
      const cacheKey = this.getToolsCacheKey(categoryId);
      const cacheData = {
        timestamp: new Date().getTime(),
        data: data,
        count: count
      };
      
      wx.setStorageSync(cacheKey, cacheData);
      console.log('工具列表已缓存:', categoryId);
    } catch (error) {
      console.error('保存工具列表缓存出错:', categoryId, error);
    }
  },

  // 获取分类数据
  async getCategories() {
    try {
      this.setData({ tabsLoading: true });
      
      // 尝试从缓存获取
      const cachedCategories = this.checkCategoriesCache();
      
      if (cachedCategories) {
        console.log('从缓存加载分类数据:', cachedCategories);
        this.setData({ 
          categories: cachedCategories,
          tabsLoading: false
        });
        
        // 加载第一个分类的数据
        if (cachedCategories.length > 0) {
          const firstCategory = cachedCategories[0];
          this.getToolsData(firstCategory.value, true);
          
          // 预加载第二个分类（如果有）
          if (cachedCategories.length > 1) {
            setTimeout(() => {
              this.preloadCategoryData(cachedCategories[1].value);
            }, 1000);
          }
        }
        
        // 返回，不再发起API请求
        return;
      }
      
      // 缓存没有或已过期，发起API请求
      const res = await api.getCategories();
      console.log('获取分类数据:', res);
      
      if (res && res.data && Array.isArray(res.data)) {
        // 确保总有一个"近期/全部更新"选项，并且始终在第一位
        let categories = res.data;
        
        // 过滤掉可能已存在的默认分类，避免重复
        categories = categories.filter(cat => 
          cat.value !== 0 && 
          cat.label !== '全部/近期更新' && 
          cat.label !== '近期更新' && 
          cat.label !== '全部' &&
          cat.label !== '近期/全部更新'
        );
        
        // 始终在第一位添加默认分类
        categories = [{ label: '近期/全部更新', value: 0 }, ...categories];
        
        // 更新数据
        this.setData({ 
          categories: categories,
          tabsLoading: false
        });
        
        // 缓存分类数据
        this.saveCategoriesCache(categories);
        
        // 默认加载第一个分类的数据
        if (categories.length > 0) {
          const firstCategory = categories[0];
          this.getToolsData(firstCategory.value, true);
          
          // 预加载第二个分类（如果有）
          if (categories.length > 1) {
            setTimeout(() => {
              this.preloadCategoryData(categories[1].value);
            }, 1000);
          }
        }
      } else {
        // 如果API返回错误或空数据，使用默认分类
        const defaultCategories = [
          { label: '近期/全部更新', value: 0 },
          { label: '实用软件', value: 1 },
          { label: '影视音乐', value: 2 },
          { label: '万能资料', value: 3 }
        ];
        
        this.setData({ 
          categories: defaultCategories,
          tabsLoading: false 
        });
        
        // 默认加载近期/全部更新
        this.getToolsData(0, true);
      }
    } catch (error) {
      console.error('获取分类失败:', error);
      
      // 出错时使用默认分类
      const defaultCategories = [
        { label: '近期/全部更新', value: 0 },
        { label: '实用软件', value: 1 },
        { label: '影视音乐', value: 2 },
        { label: '万能资料', value: 3 }
      ];
      
      this.setData({ 
        categories: defaultCategories,
        tabsLoading: false 
      });
      
              // 默认加载近期/全部更新
        this.getToolsData(0, true);
    }
  },

  // 获取工具列表数据（支持分类筛选和分页）
  async getToolsData(category = 0, isRefresh = false) {
    return new Promise(async (resolve, reject) => {
      try {
        // 防止重复加载
        if (this.data.loading || this.data.loadingMore) {
          resolve();
          return;
        }

        // 如果没有更多数据且不是刷新，直接返回
        if (!this.data.hasMore && !isRefresh) {
          resolve();
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

      // 如果是第一页，缓存结果
      if (isFirstLoad) {
        this.saveToolsCache(category, newTools, totalCount);
      }

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
      
      // 检查是否需要定位到特定工具
      if (this.data.targetToolId && isFirstLoad) {
        this.locateTargetTool(this.data.targetToolId);
      }
      
      // 预加载相邻分类
      if (isFirstLoad) {
        // 找到当前分类的索引
        const currentIndex = this.data.categories.findIndex(cat => cat.value === category);
        if (currentIndex !== -1) {
          this.preloadAdjacentCategories(currentIndex);
        }
      }

      resolve();

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
      
      reject(error);
    }
    });
  },

  // 加载更多数据
  loadMoreData() {
    if (this.data.hasMore && !this.data.loadingMore) {
      const currentCategory = this.data.categories[this.data.currentTab]?.value || 0;
      this.getToolsData(currentCategory, false);
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
    
    const currentCategory = this.data.categories[this.data.currentTab]?.value || 0;
    this.getToolsData(currentCategory, true).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 触底加载更多
  onReachBottom() {
    this.loadMoreData();
  },
  
  // 页面显示时，检查是否需要刷新数据
  onShow() {
    // 如果分类已加载，但工具列表为空，则加载数据
    if (this.data.categories.length > 0 && this.data.tools.length === 0) {
      const categoryId = this.data.categories[this.data.currentTab]?.value || 0;
      this.getToolsData(categoryId, true);
    }
  },
  
  // 搜索输入处理
  onSearchInput(e) {
    const keyword = e.detail.value;
    this.setData({
      searchKeyword: keyword
    });
  },

  // 搜索获得焦点
  onSearchFocus() {
    // 可以在这里添加搜索获得焦点时的逻辑
  },

  // 搜索失去焦点
  onSearchBlur() {
    // 可以在这里添加搜索失去焦点时的逻辑
  },

  // 搜索确认（点击键盘搜索按钮）
  onSearchConfirm(e) {
    const keyword = e.detail.value.trim();
    if (keyword) {
      this.performSearch(keyword);
    }
  },

  // 执行搜索
  async performSearch(keyword) {
    if (!keyword || keyword.trim() === '') {
      wx.showToast({
        title: '请输入搜索关键词',
        icon: 'none'
      });
      return;
    }

    try {
      this.setData({
        searchLoading: true,
        isSearchMode: true
      });

      wx.showLoading({
        title: '搜索中...',
        mask: true
      });

      const res = await api.searchToolsAdvanced(keyword, 1, 20); // 搜索最多20条结果
      console.log('搜索结果:', res);

      // 为搜索结果添加分类名称
      const resultsWithCategory = res.data.map(item => {
        const category = this.data.categories.find(cat => cat.value === item.category);
        return {
          ...item,
          categoryName: category ? category.label : '未分类'
        };
      });

      this.setData({
        searchResults: resultsWithCategory,
        searchLoading: false
      });

      wx.hideLoading();

      if (resultsWithCategory.length === 0) {
        wx.showToast({
          title: '未找到相关资源',
          icon: 'none'
        });
      }

    } catch (error) {
      console.error('搜索失败:', error);
      this.setData({
        searchLoading: false,
        searchResults: []
      });

      wx.hideLoading();
      wx.showToast({
        title: error.msg || '搜索失败',
        icon: 'none'
      });
    }
  },

  // 清空搜索
  clearSearch() {
    this.setData({
      searchKeyword: '',
      isSearchMode: false,
      searchResults: []
    });
  },

  // 退出搜索模式
  exitSearchMode() {
    this.setData({
      searchKeyword: '',
      isSearchMode: false,
      searchResults: []
    });
  },

  // 选择搜索结果（跳转到对应分类并定位）
  selectSearchResult(e) {
    const item = e.currentTarget.dataset.item;
    console.log('选择的搜索结果:', item);

    // 找到该工具对应的分类索引
    const categoryIndex = this.data.categories.findIndex(cat => cat.value === item.category);
    
    if (categoryIndex !== -1) {
      // 跳转到对应的分类tab，并设置目标工具ID
      this.setData({
        currentTab: categoryIndex,
        isSearchMode: false,
        searchKeyword: '',
        searchResults: [],
        // 重置工具列表，准备加载对应分类的数据
        tools: [],
        currentPage: 1,
        hasMore: true,
        totalCount: 0,
        // 设置目标工具ID，用于定位
        targetToolId: item.id
      });

      // 加载对应分类的数据
      const categoryId = this.data.categories[categoryIndex].value;
      this.getToolsData(categoryId, true);

      // 提示用户已跳转
      wx.showToast({
        title: `正在定位到 ${item.title}`,
        icon: 'success'
      });
    } else {
      // 如果找不到对应分类，直接显示工具详情
      this.viewDetail({ currentTarget: { dataset: { id: item.id } } });
    }
  },

  // 定位到目标工具
  locateTargetTool(targetId) {
    // 延迟执行，确保DOM渲染完成
    setTimeout(() => {
      // 找到目标工具在当前列表中的索引
      const targetIndex = this.data.tools.findIndex(tool => tool.id === targetId);
      
      if (targetIndex !== -1) {
        // 高亮目标工具
        this.setData({
          highlightedToolId: targetId
        });
        
        // 滚动到目标工具位置
        wx.pageScrollTo({
          selector: `#tool-card-${targetId}`,
          duration: 800,
          success: () => {
            console.log('成功定位到目标工具:', targetId);
            
            // 3秒后取消高亮效果
            setTimeout(() => {
              this.setData({
                highlightedToolId: null
              });
            }, 3000);
          },
          fail: (error) => {
            console.error('定位到目标工具失败:', error);
            // 如果滚动失败，尝试使用索引方式滚动
            const scrollTop = targetIndex * 240; // 每个工具卡片大约240rpx高度
            wx.pageScrollTo({
              scrollTop: scrollTop,
              duration: 800
            });
          }
        });
        
        // 清除目标工具ID
        this.setData({
          targetToolId: null
        });
        
      } else {
        console.log('目标工具不在当前页面，可能需要加载更多数据');
        // 如果目标工具不在第一页，可以考虑自动加载更多数据
        this.loadMoreUntilTarget(targetId);
      }
    }, 500);
  },

  // 加载更多数据直到找到目标工具
  loadMoreUntilTarget(targetId, attempts = 0) {
    const maxAttempts = 3; // 最多尝试3次加载更多
    
    // 检查目标工具是否已在当前列表中
    const targetIndex = this.data.tools.findIndex(tool => tool.id === targetId);
    if (targetIndex !== -1) {
      this.locateTargetTool(targetId);
      return;
    }
    
    // 如果还有更多数据且未达到最大尝试次数
    if (this.data.hasMore && attempts < maxAttempts) {
      wx.showLoading({
        title: `正在加载第${attempts + 2}页...`,
        mask: true
      });
      
      // 加载更多数据
      const currentCategory = this.data.categories[this.data.currentTab]?.value || 0;
      this.getToolsData(currentCategory, false).then(() => {
        wx.hideLoading();
        // 递归继续查找
        this.loadMoreUntilTarget(targetId, attempts + 1);
      }).catch(() => {
        wx.hideLoading();
        this.handleTargetNotFound();
      });
    } else {
      // 找不到目标工具
      this.handleTargetNotFound();
    }
  },
  
  // 处理找不到目标工具的情况
  handleTargetNotFound() {
    wx.showToast({
      title: '目标工具可能在其他分类中',
      icon: 'none'
    });
    this.setData({
      targetToolId: null
    });
  },

  // 页面加载
  onLoad() {
    // 先获取分类数据
    this.getCategories();
  }
});