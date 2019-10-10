import http from '/src/http/index.js'
import util from '/src/libs/util.js'

// 权限接口
const PERMISSIONS_URL = '/system/v1/role-action/users/actions/groups'

// 获取权限
function getPermissions() {
  return new Promise((resolve, reject) => {
    // 发送请求
    http.get({ url: PERMISSIONS_URL }).then(res => {
      if (res.status === 0) {
        resolve(res.data)
      } else {
        reject(res)
        util.ddToast({ type: 'fail', text: res.message || '获取菜单权限失败' })
      }
    })
  })
}

export {
  getPermissions
}