import util from '/src/libs/util.js'

let app = getApp()

// 初始化filter
function initFilter(l) {
  if (typeof l.filter === 'function') {
    return l.filter()
  } else {
    return undefined
  }
}

// 初始化data
function initData(l) {
  if (typeof l.data === 'function') {
    return l.data()
  } else {
    return {}
  }
}

export default (l) => {
  return Page({
    data: {
      // 权限标记，对应按钮position
      btnPos: l.btnPos !== undefined ? Object.assign({ normal: 10, edit: 11 }, l.btnPos) : { normal: 10, edit: 11 },
      // 业务对象
      bizObj: util.cloneDeep(l.bizObj),
      // 背景
      background: l.background || '#FFF',
      // 搜索框
      searchBar: l.searchBar !== undefined ? Object.assign({ bindkey: '', placeholder: '搜索' }, l.searchBar) : { bindkey: '', placeholder: '搜索' },
      // 请求参数
      params: l.params !== undefined ? util.cloneDeep(l.params) : {},
      // 过滤对象数组，用于生成过滤框内的组件，类似formPage的bizObj
      filter: initFilter(l),
      // 其他自定义数据
      ...initData(l)
    },

    async onLoad(query) {
      // 定义列表id
      this.lid = `L${this.$viewId}`
      // 获取对应表单搜索组件
      if (query.esearch) {
        this.esearch = JSON.parse(query.esearch)
      }
      // 初始化菜单信息
      this.menu = await util.getMenu(this.route)
      // 设置导航栏
      if (!l.navigationBar || !l.navigationBar.title) {
        l.navigationBar = Object.assign({ ...l.navigationBar }, { title: this.menu.menu_name })
      }
      util.setNavigationBar(l.navigationBar)
    },

    // 列表加载后触发
    async afterLoad() {
      if (l.afterLoad) {
        await l.afterLoad.apply(this, arguments)
      }
    },

    // 加载完成
    onReady() {
      // 执行业务onReady
      if (l.onReady) {
        l.onReady.apply(this, arguments)
      }
    },

    // 刷新列表
    refresh() {
      app.emitter.emit(this.lid, { type: 'refresh' })
    },

    // 退出多选模式
    checkboxInvisible() {
      app.emitter.emit(this.lid, { type: 'checkboxInvisible' })
    },

    beforeFilter() {
      if (l.beforeFilter) {
        l.beforeFilter.apply(this, arguments)
      }
    },

    // 展开其他方法
    ...l.methods
  })
}