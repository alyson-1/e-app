Component({
  props: {
    // 默认类型，参考https://wow.techbrood.com/fiddle/29490
    type: 2,
    // 单位是rpx
    size: 48,
    // 外部样式
    className: '',
    // 是否没有更多未加载
    noMore: false,
    // 加载中
    loading: false,
    // 加载文本
    loadingText: '',
    // loader颜色
    color: '#3296FA',
    // 全部加载完成提示
    noMoreText: '没有更多',
    // 文本颜色
    textColor: 'rgba(25, 31, 37, .28)'
  }
})