// pages/ask/ask.js
// import Toast from '/miniprogram_npm/@vant/weapp/toast/toast';

Page({
  data: {
    title: '',
    description: '',
    tags: [],
    currentTag: '',
    suggestedTags: ['JavaScript', 'CSS', 'Vue.js', 'React', '小程序', 'Node.js', 'Python', 'Java'], // 示例推荐标签
    rewardPoints: 0,
    isSubmitting: false,
  },

  onLoad(options) {
    // 可以在这里处理从其他页面跳转过来的参数，例如预填某些信息
  },

  onTitleInput(event) {
    this.setData({
      title: event.detail
    });
  },

  onDescriptionInput(event) {
    this.setData({
      description: event.detail
    });
  },

  onCurrentTagInput(event) {
    this.setData({
      currentTag: event.detail.trim()
    });
  },

  addTag(tagValue) {
    if (tagValue && this.data.tags.length < 5 && !this.data.tags.includes(tagValue)) {
      this.setData({
        tags: [...this.data.tags, tagValue],
        currentTag: '' // 清空输入框
      });
    } else if (this.data.tags.includes(tagValue)) {
      Toast('标签已存在');
    } else if (this.data.tags.length >= 5) {
      Toast('最多添加5个标签');
    }
  },

  onAddTagByConfirm(event) {
    const tagValue = event.detail.value.trim();
    this.addTag(tagValue);
  },

  onAddTagByButton() {
    const tagValue = this.data.currentTag;
    this.addTag(tagValue);
  },

  onRemoveTag(event) {
    const index = event.currentTarget.dataset.index;
    const newTags = [...this.data.tags];
    newTags.splice(index, 1);
    this.setData({
      tags: newTags
    });
  },

  onSelectSuggestedTag(event) {
    const tagValue = event.currentTarget.dataset.tag;
    this.addTag(tagValue);
  },

  onRewardChange(event) {
    this.setData({
      rewardPoints: event.detail
    });
  },

  submitQuestion(event) {
    if (!this.data.title.trim()) {
      Toast('请输入问题标题');
      return;
    }

    this.setData({ isSubmitting: true });

    // 模拟提交数据到后端
    console.log('提交的问题数据:', {
      title: this.data.title,
      description: this.data.description,
      tags: this.data.tags,
      rewardPoints: this.data.rewardPoints
    });

    setTimeout(() => {
      this.setData({ isSubmitting: false });
      Toast.success('提问成功！');
      // 提交成功后的操作，例如清空表单、跳转页面等
      this.setData({
        title: '',
        description: '',
        tags: [],
        currentTag: '',
        rewardPoints: 0
      });
      // wx.navigateBack(); // 或跳转到问题列表页
    }, 1500);
  }
});