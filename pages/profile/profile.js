/*
 * @Author: lishengmin shengminfang@foxmail.com
 * @Date: 2025-05-29 15:13:42
 * @LastEditors: lishengmin shengminfang@foxmail.com
 * @LastEditTime: 2025-06-19 15:00:00
 * @FilePath: /applet/app/pages/profile/profile.js
 * @Description: 个人中心页面 - 静态用户信息展示
 */

Page({
  data: {
    // 静态用户信息
    userInfo: {
      avatarUrl: 'https://bkimg.cdn.bcebos.com/pic/cb8065380cd791235f3c35afa3345982b3b78009?x-bce-process=image/format,f_auto/resize,m_lfit,limit_1,w_277',
      nickName: '工具达人',
      userId: 'TU20250619001',
      level: '🌟 VIP会员',
      downloadCount: 128,
      favoriteCount: 56,
      shareCount: 23,
      joinDate: '2024-03-15',
      lastLoginTime: '2025-06-19 14:30'
    }
  },

  onLoad() {
    console.log('个人中心页面加载');
    // 模拟加载用户统计数据
    this.loadUserStats();
  },

  onShow() {
    // 页面显示时刷新数据（如果需要）
    this.refreshUserInfo();
  },

  // 模拟加载用户统计数据
  loadUserStats() {
    // 可以在这里添加一些动态效果，比如数字递增动画
    console.log('加载用户统计数据:', this.data.userInfo);
  },

  // 刷新用户信息
  refreshUserInfo() {
    // 更新最后登录时间
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    this.setData({
      'userInfo.lastLoginTime': timeStr
    });
  },

  // 点击头像
  onAvatarTap() {
    wx.showToast({
      title: '头像功能开发中',
      icon: 'none'
    });
  },

  // 点击统计项
  onStatTap(e) {
    const type = e.currentTarget.dataset.type;
    let title = '';
    
    switch(type) {
      case 'download':
        title = '我的下载记录';
        break;
      case 'favorite':
        title = '我的收藏列表';
        break;
      case 'share':
        title = '我的分享历史';
        break;
    }
    
    wx.showToast({
      title: title + '开发中',
      icon: 'none'
    });
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: '资源工具箱 - 海量优质资源等你来',
      path: '/pages/home/home',
      imageUrl: this.data.userInfo.avatarUrl
    };
  }
});