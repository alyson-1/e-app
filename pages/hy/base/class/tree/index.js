import http from '/src/http/index.js'
import util from '/src/libs/util.js'

let app = getApp()

Page({
  data: {
    // 提交接口
    url: '/business/item-class',
    // 是否只能选择最后一级
    last: false,
    // 绑定的字段名
    bindkey: 'item_name',
    // 动态按钮
    btns: [],
    // 动态按钮位置
    btnPos: 10,
    // 原始树结构
    tree: [],
    // 根节点
    root: {},
    // 当前可选节点
    array: [],
    // 面包屑
    breadcrumb: [],
    // 带有children的子节点索引数组
    childrenIndexArr: [],
    // 当前节点
    current: '',
    // 当前节点索引
    currentIndex: '',
    // 表单页面
    form: '/pages/hy/base/class/form/index',
    // 页面背景
    background: '#FFF',
    // 导航栏
    navigationBar: {
      title: '',
      backgroundColor: ''
    }
  },

  async onLoad(query) {
    // 设置页面id
    this.pid = `P${this.$viewId}`
    // 获取当前菜单
    this.menu = await util.getMenu(this.route)
    // 初始化动态按钮
    this.initBtns()
    // 设置导航栏
    let navigationBar = {}
    if (!this.data.navigationBar || !this.data.navigationBar.title) {
      navigationBar = Object.assign({ ...this.data.navigationBar }, { title: this.menu.menu_name })
    }
    util.setNavigationBar(navigationBar)
    // 加载
    this.loadMore()
    // 初始化面包屑
    this.initBreadcrumb()
    // 初始化事件监听器
    this.initEventListener()
  },

  // 事件销毁
  onUnload() {
    app.emitter.removeListener(`${this.pid}`, this.handleEvent, this)
  },

  // 加载数据
  loadMore() {
    http.get({ url: this.data.url }).then(res => {
      if (res.status === 0) {
        this.initTree(res.data[0].children)
        dd.stopPullDownRefresh()
        this.setData({ root: res.data[0] })
      } else {
        util.ddToast({ type: 'fail', text: res.message || '获取耗材分类失败' })
      }
    })
  },

  // 初始化面包屑
  initBreadcrumb() {
    this.setData({
      'current': '',
      'currentIndex': '',
      'breadcrumb': ['大类'],
      'childrenIndexArr': ['大类']
    })
  },

  // 打开下一级
  handleNext(event) {
    let i = event.currentTarget.dataset.i
    let item = this.data.array[i]
    this.$spliceData({
      'array': [0, this.data.array.length, ...item.children],
      'breadcrumb': [this.data.breadcrumb.length, 0, item[this.data.bindkey]],
      'childrenIndexArr': [this.data.childrenIndexArr.length, 0, i]
    })
    this.clearCurrent()
  },

  // 面包屑点击
  handleBreadcrumbTap({ index, value }) {
    if (this.data.childrenIndexArr.length - 1 === index) {
      return
    }
    this.clearCurrent()
    let arr = this.data.tree.slice(0)
    for (let i = 0; i < index; i++) {
      arr = arr[this.data.childrenIndexArr[i + 1]].children
    }
    this.$spliceData({
      'array': [0, this.data.array.length, ...arr],
      'breadcrumb': [index + 1, this.data.breadcrumb.length - index - 1],
      'childrenIndexArr': [index + 1, this.data.childrenIndexArr.length - index - 1]
    })
  },

  // 初始化树
  initTree(tree) {
    let temp = util.cloneDeep(tree)
    let array = []
    for (let i = 0; i < temp.length; i++) {
      array.push(temp[i])
    }
    this.$spliceData({
      'array': [0, this.data.array.length, ...array],
      'tree': [0, this.data.array.length, ...array]
    })
  },

  // 页面刷新
  onPullDownRefresh() {
    // 加载
    this.loadMore()
    // 初始化面包屑
    this.initBreadcrumb()
  },

  // 单选切换
  radioChange(event) {
    let i = event.currentTarget.dataset.i
    let item = this.data.array[i]
    this.setData({
      'current': item,
      'currentIndex': i
    })
  },

  // 清空当前所选
  clearCurrent() {
    this.setData({
      'current': '',
      'currentIndex': ''
    })
  },

  // 点击当前节点
  handleTap(event) {
    let node = event.currentTarget.dataset.node
    if (node.pid) {
      node.pname = this.data.breadcrumb[this.data.breadcrumb.length - 1]
    }
    let list = { lid: this.pid, index: '', data: node }
    dd.navigateTo({
      url: `${this.data.form}?list=${JSON.stringify(list)}`
    })
  },

  // 初始化事件监听器
  initEventListener() {
    app.emitter.on(`${this.pid}`, this.handleEvent, this)
  },

  // 事件处理
  handleEvent(event) {
    switch (event.type) {
      case 'refresh':
        this.refresh()
        break
      default:
        break
    }
  },

  // 初始化动态按钮
  initBtns() {
    util.db.get({ dbName: 'permission', user: true }).then(data => {
      let id = this.menu.id
      this.setData({
        btns: data[id]
      })
    })
  },

  // 动态按钮事件
  handleBtn(event) {
    let btn = event.currentTarget.dataset.btn
    this[btn.handler](btn)
  },

  // 默认的删除方法
  handleDelete() {
    if (!this.data.current) {
      util.ddToast({ type: 'fail', text: '请先选择需要删除的分类' })
      return
    }
    let name = this.data.current[this.data.bindkey]
    dd.confirm({
      title: '温馨提示',
      content: `确认删除分类 ${name} 吗?`,
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      success: (res) => {
        if (res.confirm) {
          let options = {
            url: this.data.url,
            params: [this.data.current.id]
          }
          http.delete(options).then(res => {
            if (res.status === 0) {
              util.ddToast({ type: 'success', text: '删除成功' })
              this.refresh()
            } else {
              util.ddToast({ type: 'fail', text: res.message || '删除失败' })
            }
          })
        }
      }
    })
  },

  // 刷新方法
  refresh() {
    // 加载
    this.loadMore()
    // 初始化面包屑
    this.initBreadcrumb()
  },

  // 默认的新增方法
  handleAdd() {
    let list = { lid: this.pid }
    if (this.data.current) {
      list.data = { pid: this.data.current.id, pname: this.data.current.item_name }
    } else {
      list.data = { pid: this.data.root.id }
    }
    dd.navigateTo({
      url: `${this.data.form}?list=${JSON.stringify(list)}`
    })
  }
})