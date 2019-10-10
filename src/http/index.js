import util from '/src/libs/util.js'
import TDO from '/src/mock/index.js'

// http对象
const http = {
  // 通用get方法
  get: function(options, mock) {
    return new Promise((resolve, reject) => {
      // 获取mock数据
      if (mock && mock.mock && TDO[mock.mock]) {
        resolve(TDO[mock.mock].data)
        return
      }
      dd.httpRequest({
        // 拼接完整请求地址
        url: getApp().globalData.host + options.url,
        method: 'GET',
        // 请求参数
        data: options.params !== undefined ? options.params : undefined,
        // 请求头
        headers: { 'Authorization': getApp().globalData.token || undefined },
        success: (res) => resolve(res.data),
        fail: (err) => {
          reject(err)
          handleError(err)
        }
      })
    })
  },

  // 通用post方法
  post: function(options, mock) {
    return new Promise((resolve, reject) => {
      // 获取mock数据
      if (mock && mock.mock && TDO[mock.mock]) {
        resolve(TDO[mock.mock].data)
        return
      }
      dd.httpRequest({
        // 拼接完整请求地址
        url: getApp().globalData.host + options.url,
        method: 'POST',
        // 请求参数
        data: options.params !== undefined ? JSON.stringify(options.params) : undefined,
        // 请求头
        headers: {
          'Authorization': getApp().globalData.token || undefined,
          'Content-Type': 'application/json;charset=UTF-8'
        },
        success: (res) => resolve(res.data),
        fail: (err) => {
          reject(err)
          handleError(err)
        }
      })
    })
  },

  // 通用delete方法，小程序框架不支持delete方法
  delete: function(options, mock) {
    options.url += '/delete'
    return this.post(options, mock)
  }
}

// 错误处理方法
function handleError(err) {
  let message = '请求错误'
  if (err.error) {
    // 判断错误码
    switch (err.error) {
      case 11: message = '无权跨域'; break
      case 12: message = '网络出错'; break
      case 13: message = '超时'; break
      case 14: message = '解码失败'; break
      case 19: message = 'HTTP错误'; break
      default: break
    }
  }
  util.ddToast({ type: 'fail', text: message })
  console.error(err)
}

export default http