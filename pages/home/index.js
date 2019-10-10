import { getPermissions } from '/src/api/sys/permission.js'
import util from '/src/libs/util.js'

Page({
  data: {
    // 禁止显示的菜单，此处考量是基于移动端和pc的不同，例如系统管理菜单，必须和菜单的menu_name一致
    disabled: ['组织结构', '菜单管理', '角色管理', '权限分配', '用户管理'],
    // 静态菜单，所有用户都可见
    staticMenuGroup: []
  },

  // 初始化
  onLoad(query) {
    // 初始化固定菜单权限
    let obj = {}
    if (this.data.staticMenuGroup) {
      // 遍历菜单，以id为key，权限数组为value
      for (let i = 0; i < this.data.staticMenuGroup.length; i++) {
        let group = this.data.staticMenuGroup[i]
        for (let j = 0; j < group.children.length; j++) {
          let menu = group.children[j]
          if (menu.permission) {
            obj[menu.id] = menu.permission
          }
        }
      }
    }
    // 获取动态菜单权限
    getPermissions().then(data => {
      // 整合静态菜单和动态菜单权限，并储存本地缓存
      util.db.set({ dbName: 'permission', user: true, value: { ...obj, ...data } })
    })
  }
})