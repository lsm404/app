/*
 * @Author: lishengmin shengminfang@foxmail.com
 * @Date: 2025-05-29 15:13:42
 * @LastEditors: lishengmin shengminfang@foxmail.com
 * @LastEditTime: 2025-05-30 11:42:11
 * @FilePath: /miniprogram-8/pages/profile/profile.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// pages/profile/profile.js
const app = getApp();

Page({
  data: {
    userInfo: null, // { avatarUrl: '', nickName: '', userId: '' }
  },

  onShow() {
    // 页面显示时尝试获取用户信息
    this.getUserProfile();
  },

  getUserProfile() {
    // 实际项目中，这里应该从全局状态管理或本地存储中获取用户信息
    // 如果没有，则可能需要引导用户登录
    const storedUserInfo = wx.getStorageSync('userInfo');
    if (storedUserInfo) {
      this.setData({
        userInfo: storedUserInfo
      });
    } else {
      this.setData({
        userInfo: null // 确保未登录状态正确显示
      });
    }
  },

  login() {
    // 实际项目中，这里会调用 wx.getUserProfile 获取用户信息，并进行登录操作
    // 示例：模拟登录成功
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        const mockUserInfo = {
          avatarUrl: res.userInfo.avatarUrl,
          nickName: res.userInfo.nickName,
          userId: 'mockUser123' // 实际应从后端获取
        };
        this.setData({
          userInfo: mockUserInfo
        });
        wx.setStorageSync('userInfo', mockUserInfo);
        wx.showToast({ title: '登录成功', icon: 'success' });
      },
      fail: () => {
        wx.showToast({ title: '授权失败', icon: 'none' });
      }
    });
  },

  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            userInfo: null
          });
          wx.removeStorageSync('userInfo');
          wx.showToast({ title: '已退出', icon: 'success' });
        }
      }
    });
  }
  // 移除了 navigateToMyQuestions, navigateToMyAnswers 等方法
});