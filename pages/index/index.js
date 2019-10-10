Page({
  data: {
    // loader类别，参考https://wow.techbrood.com/fiddle/29490
    type: 12,
    // 加载状态
    loading: true,
    // 页面背景
    background: '#FFF',
    // 加载说明
    loadingText: '系统正在初始化',
    // 组织名称
    corp: getApp().globalData.corp,
    // 组织logo
    logo: getApp().globalData.logo
  }
})