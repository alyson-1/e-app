// 工具类对象
const util = {
  // 合并url和query参数
  formatUrl(url, params) {
    if (!params) {
      return url
    }
    let _url = url + '?'
    for (let key in params) {
      _url += `${key}=${params[key]}&`
    }
    return _url.substr(0, _url.length - 1)
  },

  // 格式化日期
  formatDate(fmt, date) {
    var o = {
      "M+": date.getMonth() + 1,
      "d+": date.getDate(),
      "H+": date.getHours(),
      "m+": date.getMinutes(),
      "s+": date.getSeconds(),
      "q+": Math.floor((date.getMonth() + 3) / 3),
      "S": date.getMilliseconds()
    }
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length))
    }
    for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)))
      }
    return fmt
  },

  // 全局toast
  ddToast({ type, text, interval }) {
    dd.showToast({
      type: type,
      content: text,
      duration: interval
    })
  },

  // 暂停函数
  sleep(duration) {
    return new Promise(resolve => {
      setTimeout(resolve, duration)
    })
  },

  // 设置导航栏
  setNavigationBar({ title, reset, backgroundColor }) {
    dd.setNavigationBar({
      title: title,
      reset: reset,
      backgroundColor: backgroundColor
    })
  },

  // 深拷贝，不会拷贝函数
  cloneDeep(obj) {
    if (typeof obj !== 'object') {
      return obj
    }
    let temp = {}
    temp = JSON.parse(JSON.stringify(obj))
    return temp
  },

  // 去抖函数
  debounce(func, delay) {
    let timer
    return function() {
      let args = arguments
      clearTimeout(timer)
      timer = setTimeout(() => {
        func.apply(this, args)
      }, delay || 1000)
    }
  },

  // 判断a和b是否相等
  equal(a, b) {
    if (typeof a === 'function' || typeof b === 'function') {
      return false
    }
    if (typeof a !== typeof b) {
      return false
    }
    if (typeof a === 'object') {
      return JSON.stringify(a) === JSON.stringify(b)
    }
    return a === b
  },

  // 本地缓存，默认区分用户
  db: {
    // 写
    set({ dbName = 'db', path = '', value = '', user = true }) {
      return new Promise((resolve, reject) => {
        dd.setStorage({
          key: pathInit({ dbName, path, user }),
          data: value,
          success: (result) => {
            resolve(result)
          },
          fail: (err) => {
            reject(err)
          }
        })
      })
    },

    // 读
    get({ dbName = 'db', path = '', defaultValue = '', user = true }) {
      return new Promise((resolve, reject) => {
        dd.getStorage({
          key: pathInit({ dbName, path, user, defaultValue }),
          success: (result) => {
            resolve(result.data)
          },
          fail: (err) => {
            reject(err)
          }
        })
      })
    },

    // 删除
    remove({ dbName = 'db', path = '', user = true }) {
      return new Promise((resolve, reject) => {
        dd.removeStorage({
          key: pathInit({ dbName, path, user }),
          success: (result) => {
            resolve(result)
          },
          fail: (err) => {
            reject(err)
          }
        })
      })
    }
  },

  // 根据当前页面路由获取菜单数据
  getMenu(route) {
    return new Promise((resolve, reject) => {
      this.db.get({ dbName: 'menu', user: true }).then(data => {
        for (let i = 0; i < data.length; i++) {
          let arr = data[i].mobile_url.split(';')
          if (arr.includes(`/${route}`)) {
            resolve(this.cloneDeep(data[i]))
            break
          }
        }
        resolve(false)
      })
    })
  },

  // 根据id获取组件实例
  getComponentById(componentId) {
    if (!componentId) {
      return false
    }
    let currentPage = getCurrentPages().slice(-1)[0]
    let instances = function(id) {
      return this.$getComponentBy((instance) => { return instance.props.id === id }, { returnOnFirstMatch: true })
    }.apply(currentPage, [componentId])
    return instances.length ? instances[0] : false
  },

  // 通用基础组件校验
  baseValidate(componentArr) {
    let key = ''
    for (let i = 0; i < componentArr.length; i++) {
      let c = componentArr[i]
      key = c.label
      if (c.component === 'e-subform') {
        for (let j = 0; j < c.children.length; j++) {
          let sf = c.children[j]
          for (let k = 0; k < sf.length; k++) {
            if (sf[k].status === 'error') {
              key += `-${j + 1}`
              util.ddToast({ type: 'fail', text: `${sf[k].label}（${key}）${sf[k].notice}` })
              return false
            }
          }
        }
      } else {
        if (c.status === 'error') {
          util.ddToast({ type: 'fail', text: key + c.notice })
          return false
        }
      }
    }
    return true
  }
}

// 初始化缓存路径
function pathInit({ dbName = 'db', path = '', user = true, validator = () => true, defaultValue = '' }) {
  const uuid = getApp().globalData.userInfo.id || 'ghost-uuid'
  const currentPath = `${dbName}.${user ? `user.${uuid}` : 'public'}${path ? `.${path}` : ''}`
  const value = dd.getStorageSync({ key: currentPath }).data
  if (!(value !== undefined && validator(value))) {
    dd.setStorageSync({
      key: currentPath,
      data: defaultValue
    })
  }
  return currentPath
}

export default util
