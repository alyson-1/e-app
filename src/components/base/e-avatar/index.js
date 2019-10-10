import http from '/src/http/index.js'

Component({
  data: {
    // 请求回来的用户信息
    userInfo: {}
  },

  props: {
    user: {},
    size: '80',
    className: 'flex-col',
    onUserTap: () => { }
  },

  didMount() {
    // 判断是否需要请求用户头像信息
    if (!this.props.user.name && this.props.user.userId) {
      this.initUser()
    }
  },

  methods: {
    // 初始化用户头像
    initUser() {
      let options = { url: '', params: { userId: this.props.params.userId } }
      http.get(options).then(res => {
        if (res.status === 0) {
          this.setData({
            userInfo: res.data
          })
        } else {
          console.error(res)
        }
      })
    },

    // 点击头像
    handleTap(event) {
      if (this.props.onUserTap) {
        this.props.onUserTap(event, this)
      }
    }
  }
})