import http from '/src/http/index.js'
import util from '/src/libs/util.js'

// 登录接口
const LOGIN_URL = '/dingding/v1/login'
// token刷新接口
const REFRESH_URL = '/uaa/auth/refresh'
// token刷新间隔
const REFRESH_INTERVAL = 900000

// 登录方法
function login() {
  // 获取免登授权码
  dd.getAuthCode({
    success: (res) => {
      // 配置请求头
      let options = { url: LOGIN_URL, params: { code: res.authCode } }
      // 发送请求
      http.get(options).then(res => {
        if (res.status === 0) {
          // 储存用户信息、tolen
          getApp().globalData.userInfo = res.data
          getApp().globalData.token = res.data.token
          // 发送问候语
          welcome(res.data.dd_user_info.Name)
          // 跳转到主页
          dd.switchTab({ url: '/pages/home/index' })
          // 开始刷新token
          refreshToken()
        } else {
          // 登录出错
          util.ddToast({ type: 'fail', text: res.message || '登录失败' })
        }
      })
    },
    // 获取免登授权码失败
    fail: (err) => {
      util.ddToast({ type: 'fail', text: '获取免登授权码出错，请联系管理员' })
      console.error(err)
    }
  })
}

// 刷新token方法
function refreshToken() {
  // 判断刷新器是否存在
  if (getApp().refresher) {
    clearInterval(getApp().refresher)
  }
  // 定义刷新器
  getApp().refresher = setInterval(() => {
    http.post({ url: REFRESH_URL }).then(res => {
      if (res.status === 0) {
        // 替换token
        getApp().globalData.token = res.data.token
      } else {
        util.ddToast({ type: 'fail', text: res.message || 'token刷新失败' })
      }
    })
  }, REFRESH_INTERVAL)
}

// 问候方法
function welcome(name) {
  let welcome = ''
  let time = new Date().getHours()
  if (time <= 11) welcome = '上午好'
  else if (time > 11 && time <= 13) welcome = '中午好'
  else if (time > 13 && time <= 17) welcome = '下午好'
  else if (time > 17) welcome = '晚上好'
  util.ddToast({ type: 'success', text: `亲爱的${name}，${welcome}`, interval: 1000 })
}

export default login