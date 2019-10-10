import util from '/src/libs/util.js'
import clear from '../mixins/clear.js'
import mount from '../mixins/mount.js'
import validate from '../mixins/validate.js'

Component({
  mixins: [mount, validate, clear],

  data: {
    tree: [], // 树结构
    cascaderVisible: false, // 是否展开选择器
    array: [], // 当前可选数组
    breadcrumb: [], // 面包屑
    childrenIndexArr: [], // 带有children的子节点索引数组
    current: '', // 当前所选项
    currentIndex: '' // 当前选中对象索引
  },

  props: {
    model: {},
    // 默认校验方法
    onValidate: () => true
  },

  // 挂载
  didMount() {
    this.initBreadcrumb()
  },

  // 更新
  didUpdate(prevProps, prevData) {
    if (!util.equal(prevProps.model.tree, this.props.model.tree)) {
      this.initBreadcrumb()
      this.initTree(this.props.model.tree)
    }
  },

  methods: {
    // 初始化面包屑
    initBreadcrumb() {
      this.setData({
        'current': '',
        'breadcrumb': [this.props.model.label],
        'childrenIndexArr': [this.props.model.label]
      })
    },

    // 清空当前所选
    clearCurrent() {
      this.setData({
        'current': '',
        'currentIndex': ''
      })
    },

    // 单选切换
    radioChange(event) {
      let i = event.currentTarget.dataset.itemIndex
      let item = this.data.array[i]
      if (item.children.length && this.props.model.last) {
        this.$spliceData({
          'array': [0, this.data.array.length, ...item.children],
          'breadcrumb': [this.data.breadcrumb.length, 0, item[this.props.model.bindkey]],
          'childrenIndexArr': [this.data.childrenIndexArr.length, 0, i]
        })
        this.clearCurrent()
      } else {
        this.setData({
          'current': item,
          'currentIndex': i
        })
      }
    },

    // 打开下一级
    handleNext(event) {
      let i = event.currentTarget.dataset.itemIndex
      let item = this.data.array[i]
      this.$spliceData({
        'array': [0, this.data.array.length, ...item.children],
        'breadcrumb': [this.data.breadcrumb.length, 0, item[this.props.model.bindkey]],
        'childrenIndexArr': [this.data.childrenIndexArr.length, 0, i]
      })
      this.clearCurrent()
    },

    // 点击确认
    handleSelect() {
      if (!this.data.current) {
        util.ddToast({ type: 'fail', text: '请选择一个有效值' })
        return
      }
      let value = `${this.path}.value`
      this.$page.setData({
        [value]: this.data.current
      })
      this.handleClose()
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

    // 打开
    handleOpen(event) {
      if (this.props.model.disabled) {
        return
      }
      if (!this.props.model.tree.length) {
        util.ddToast({ type: 'none', text: '没有数据' })
        return
      }
      this.setData({
        'cascaderVisible': true
      })
    },

    // 关闭
    handleClose(event) {
      this.setData({
        'cascaderVisible': false
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

    // 初始化model的属性
    init(model) {
      // cascader对象
      let cascader = {
        tree: [],
        value: '',
        label: '',
        last: true, // 是否选到最后一级
        bindkey: '',
        disabled: false,
        necessary: false,
        placeholder: model.necessary ? '必填' : ''
      }
      // 补全属性
      this.$page.setData({
        [this.path]: Object.assign(cascader, model, this.initValidate(model))
      })
      // 初始化完成后初始化树
      this.initTree(cascader.tree)
    }
  }
})