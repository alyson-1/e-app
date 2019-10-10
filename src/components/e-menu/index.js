import { getMenuTree } from '/src/api/sys/menu.js'
import util from '/src/libs/util.js'

Component({
  data: {
    // 分组菜单数组
    menuGroup: [],
    // 展开的菜单分组
    opened: {}
  },

  props: {
    // 每行最大菜单数
    column: 4,
    // 禁止显示的菜单
    disabled: [],
    // 固定菜单
    staticMenuGroup: [],
    // 背景
    background: 'rgba(0, 0, 0, 0)'
  },

  didMount() {
    this.initMenu()
  },

  methods: {
    // 初始化菜单
    initMenu() {
      getMenuTree().then(data => {
        let menuGroup = []
        if (this.props.staticMenuGroup.length) {
          menuGroup = util.cloneDeep(this.props.staticMenuGroup)
        }
        // 整合菜单
        this.formatMenu(menuGroup, data[0])
        this.setData({
          menuGroup: menuGroup
        })
        // 持久化菜单数据到本地
        this.saveMenu(menuGroup)
      })
    },

    // 保存菜单数组到本地缓存
    saveMenu(menuGroup) {
      let array = []
      for (let i = 0; i < menuGroup.length; i++) {
        array.push(...menuGroup[i].children)
      }
      util.db.set({ dbName: 'menu', user: true, value: array })
    },

    // 格式化菜单
    formatMenu(menuGroup, menuTree) {
      if (menuTree.children) {
        let array = []
        for (let i = 0; i < menuTree.children.length; i++) {
          let menu = menuTree.children[i]
          if (this.props.disabled.includes(menu.menu_name)) {
            continue
          }
          if (menu.mobile_url) {
            array.push(menu)
          } else {
            this.formatMenu(menuGroup, menu)
          }
        }
        if (array.length) {
          menuGroup.push({ title: menuTree.menu_name, children: array })
        }
      }
    },

    // 菜单点击事件
    handleTap(event) {
      let menu = event.target.dataset.menu
      dd.navigateTo({
        url: menu.mobile_url.split(';')[0]
      })
    },

    // 切换是否可见
    handleSwitch(event) {
      let i = event.target.dataset.i
      let path = `opened[${i}]`
      this.setData({
        [path]: this.data.opened[i] !== undefined ? !this.data.opened[i] : false
      })
    }
  }
})