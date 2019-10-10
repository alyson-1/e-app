import util from '/src/libs/util.js'
import http from '/src/http/index.js'

let app = getApp()

Component({
  data: {
    // 列表数据
    array: [],
    // 搜索栏可见
    searchVisible: false,
    // 过滤部件可见
    filterVisible: false,
    // 多选是否可见
    checkboxVisible: false,
    // 已勾选单项的id数组
    checkedArray: [],
    // 是否更多
    more: true,
    // 加载
    loading: false,
    // 搜索关键字
    keyword: '',
    // 请求参数（默认）
    params: {
      page: 1,
      limit: 30,
      sort: 'desc',
      idField: 'id',
      pageable: true,
      orderBy: 'create_on'
    }
  },

  didMount() {
    this.initBtns()
    this.loadMore()
    this.initPullRefresh()
    this.initEventListener()
  },

  didUpdate(prevProps, prevData) {
    // 多选状态切换时更新已选项目
    if (this.data.checkboxVisible) {
      this.getCheckedItems()
    }
  },

  // 组件销毁时销毁事件监听器
  didUnmount() {
    app.emitter.removeListener(`${this.$page.lid}`, this.handleEvent, this)
  },

  methods: {
    // 打开搜索框
    handleSearchVisible() {
      this.setData({
        searchVisible: true
      })
    },

    // 关闭搜索框
    handleSearchInvisible() {
      this.setData({
        searchVisible: false
      })
      this.handleInput({ detail: { value: '' } })
    },

    // 打开过滤部件
    handleFilterVisible() {
      this.setData({
        filterVisible: true
      })
    },

    // 关闭过滤部件
    handleFilterInvisible() {
      this.setData({
        filterVisible: false
      })
    },

    // 手指滑动时
    handleTouchMove(event) {
      if (this.touchMoving) {
        return
      }
      this.touchMoving = true
    },

    // 滑动结束
    handleTouchEnd(event) {
      this.touchMoving = false
    },

    // 搜索，延迟300ms
    handleInput: util.debounce(function(event) {
      if (this.data.keyword !== event.detail.value) {
        this.reset(event.detail.value)
      }
    }, 300),

    // 重置搜索框/刷新事件
    reset(value, filter) {
      this.setData({
        array: [],
        keyword: value,
        more: true,
        'params.page': 1
      }, () => {
        this.loadMore(filter)
      })
    },

    // 初始化动态按钮
    initBtns() {
      util.db.get({ dbName: 'permission', user: true }).then(data => {
        let id = this.$page.menu.id
        this.setData({
          btns: data[id]
        })
      })
    },

    // 清空搜索框
    handleClear() {
      this.handleInput({ detail: { value: '' } })
    },

    // 关闭编辑模式，清空选中值
    handleCheckboxInvisible() {
      this.setData({
        checkboxVisible: false
      })
      this.$spliceData({
        checkedArray: [0, this.data.checkedArray.length]
      })
      this.handleSelectAll(false)
    },

    // 多选框全选函数
    handleSelectAll(checked) {
      let arr = util.cloneDeep(this.data.array)
      for (let i = 0; i < arr.length; i++) {
        arr[i].checked = checked
      }
      this.$spliceData({
        array: [0, this.data.array.length, ...arr]
      })
    },

    // 全选、全不选切换
    toggleSelectAll() {
      if (this.data.checkedArray.length === this.data.array.length) {
        this.handleSelectAll(false)
        return
      }
      this.handleSelectAll(true)
    },

    // 单个项目点击事件
    handleSelect(event) {
      let i = event.target.dataset.i
      let item = this.data.array[i]
      // 编辑模式下 点击事件为切换选中状态
      if (this.data.checkboxVisible) {
        this.toggleCheckeBox(i, item)
      }
      // 如果是搜索模式 则返回到e-search组件
      else if (this.$page.esearch && this.$page.esearch.cid) {
        app.emitter.emit(this.$page.esearch.cid, item)
        dd.navigateBack({
          delta: 1
        })
      }
      // 否则跳转到详情页面
      else {
        let list = { lid: this.$page.lid, index: i, data: item }
        dd.navigateTo({
          url: `${this.props.bizObj.form}?list=${JSON.stringify(list)}`
        })
      }
    },

    // 显示checkbox，打开编辑模式
    handleCheckboxVisible(event) {
      if (this.data.checkboxVisible || this.touchMoving) {
        return
      }
      let i = event.target.dataset.i
      let checked = `array[${i}].checked`
      this.setData({
        checkboxVisible: true,
        [checked]: true
      })
    },

    // 切换单个checkbox状态
    toggleCheckeBox(index, item) {
      let key = `array[${index}].checked`
      this.setData({
        [key]: !item.checked
      })
    },

    // 动态按钮事件
    handleBtn(event) {
      let btn = event.target.dataset.btn
      if (this.$page[btn.handler]) {
        this.$page[btn.handler](btn, this.data.checkedArray)
      } else if (this[btn.handler]) {
        this[btn.handler](btn)
      }
    },

    // 加载方法
    loadMore(filter) {
      // 防止数据频繁请求
      if (!this.data.more || this.data.loading) {
        return
      }
      // 设置请求状态
      this.setData({
        loading: true
      })
      if (!filter) {
        filter = {}
        if (this.props.searchBar.bindkey !== undefined) {
          filter[this.props.searchBar.bindkey] = this.data.keyword
        }
      }
      if (this.$page.esearch && this.$page.esearch.filter) {
        Object.assign(this.$page.esearch.filter, filter)
      }
      let params = Object.assign({ ...this.data.params }, this.$page.data.params, { params: JSON.stringify(filter) })
      let options = {
        url: this.props.bizObj.url,
        params: params
      }
      http.get(options, this.props.bizObj).then(res => {
        if (res.status === 0) {
          this.$page.afterLoad(res.data)
          this.$spliceData({
            array: [this.data.array.length, 0, ...res.data.items]
          })
          this.setData({
            more: res.data.items.length === params.limit,
            'params.page': this.data.params.page + 1
          })
        } else {
          util.ddToast({ type: 'fail', text: res.message || '请求列表数据失败' })
        }
        this.finishLoading()
      }).catch(err => {
        this.finishLoading()
      })
      this.handleFilterInvisible()
    },

    // 请求完成处理
    finishLoading() {
      this.setData({
        loading: false
      })
      dd.stopPullDownRefresh()
    },

    // 获取已选择的单项的id
    getCheckedItems() {
      let arr = []
      this.data.array.forEach((item) => {
        if (item.checked) {
          arr.push(item)
        }
      })
      this.$spliceData({
        'checkedArray': [0, this.data.checkedArray.length, ...arr]
      })
    },

    // 根据过滤器中的内容进行搜索
    handleSearchByFilter() {
      let filter = {}
      // 整合过滤条件
      if (this.$page.data.filter && this.$page.data.filter.length) {
        for (let i = 0; i < this.$page.data.filter.length; i++) {
          let item = this.$page.data.filter[i]
          filter[item.key] = item.value
        }
      }
      // 过滤前处理
      this.$page.beforeFilter(filter)
      this.reset(this.data.keyword, filter)
    },

    // 重置过滤条件
    handleClearFilter() {
      let filter = {}
      if (this.$page.data.filter && this.$page.data.filter.length) {
        for (let i = 0; i < this.$page.data.filter.length; i++) {
          let item = this.$page.data.filter[i]
          let key = `filter[${i}].value`
          switch (item.component) {
            case 'e-dept-chooser':
              filter[key] = []
              break
            case 'e-interval':
              filter[key] = ['', '']
              break
            case 'e-progress-bar':
              filter[key] = 0
              break
            case 'e-user-chooser':
              filter[key] = []
              break
            default:
              filter[key] = ''
              break
          }
        }
        this.$page.setData({
          ...filter
        })
      }
    },

    // 无效事件
    void() { },

    // 给当前page添加下拉刷新方法，会覆盖page的刷新方法！
    initPullRefresh() {
      this.$page.onPullDownRefresh = () => {
        this.reset(this.data.keyword)
      }
    },

    // 列表新增方法
    listAdd(data) {
      this.$spliceData({
        array: [0, 0, data]
      })
    },

    // 列表编辑方法
    listEdit(index, data) {
      this.$spliceData({
        array: [index, 1, data]
      })
    },

    // 初始化事件监听器
    initEventListener() {
      app.emitter.on(`${this.$page.lid}`, this.handleEvent, this)
    },

    // 事件处理
    handleEvent(event) {
      switch (event.type) {
        case 'add':
          this.listAdd(event.data)
          break
        case 'edit':
          this.listEdit(event.index, event.data)
          break
        case 'refresh':
          this.reset('')
          break
        case 'checkboxInvisible':
          this.handleCheckboxInvisible()
          break
        default:
          break
      }
    },

    // 默认的添加事件，跳转到表单页面
    handleAdd() {
      if (!this.props.bizObj.form) {
        return
      }
      let list = { lid: this.$page.lid }
      dd.navigateTo({
        url: `${this.props.bizObj.form}?list=${JSON.stringify(list)}`
      })
    },

    // 默认的删除方法
    handleDelete() {
      if (!this.data.checkedArray.length) {
        util.ddToast({ type: 'fail', text: '请先选择需要删除的项' })
        return
      }
      dd.confirm({
        title: '温馨提示',
        content: `确认删除已勾选的${this.data.checkedArray.length}项吗?`,
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        success: (res) => {
          if (res.confirm) {
            let options = {
              url: this.props.bizObj.url,
              params: this.data.checkedArray.map(item => item.id)
            }
            http.delete(options).then(res => {
              if (res.status === 0) {
                util.ddToast({ type: 'success', text: '删除成功' })
                this.reset('')
                this.handleCheckboxInvisible()
              } else {
                util.ddToast({ type: 'fail', text: res.message || '删除失败' })
              }
            })
          }
        }
      })
    }
  }
})