Component({
  data: {
    visible: false,
    title: '',
    confirmButtonText: '',
    cancelButtonText: ''
  },

  props: {
    width: '80%',
    height: '60%',
    background: '#FFFFFF',
    className: ''
  },

  methods: {
    // 打开弹出层，并监听确认和取消操作
    confirm(config) {
      this.setData({
        title: config.title || '',
        confirmButtonText: config.confirmButtonText || '确认',
        cancelButtonText: config.cancelButtonText || '取消',
        visible: true
      })
      this.confirmSuccess = config.success || function() { }
      this.confirmFail = config.fail || function() { }
    },

    // 确认操作
    handleConfirm() {
      if (this.confirmSuccess() === false) {
        return
      }
      this.setData({ visible: false })
    },

    // 取消操作
    handleCancel() {
      this.confirmFail()
      this.setData({ visible: false })
    }
  }
})