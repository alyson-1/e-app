import http from '/src/http/index.js'
import util from '/src/libs/util.js'

// 菜单树接口
const MENU_TREE_URL = '/system/v1/role-action/users/menus'

// 获取菜单树
function getMenuTree() {
  return new Promise((resolve, reject) => {
    // 发送请求
    http.get({ url: MENU_TREE_URL }).then(res => {
      if (res.status === 0) {
        resolve(res.data)
      } else {
        reject(res)
        util.ddToast({ type: 'fail', text: res.message || '获取菜单失败' })
      }
    })
  })
}

export {
  getMenuTree
}