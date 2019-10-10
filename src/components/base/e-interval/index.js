import util from '/src/libs/util.js'
import mount from '../mixins/mount.js'

Component({
  mixins: [mount],

  props: {
    model: {},
    // 默认校验方法
    onValidate: () => true
  },

  // 更新后进行校验
  didUpdate(prevProps, prevData) {
    if (!util.equal(prevProps.model.value, this.props.model.value)) {
      this.validate()
    }
  },

  methods: {
    // 打开datepicker
    handleTapStart(event) {
      if (this.props.model.disabled) {
        return
      }
      dd.datePicker({
        format: this.props.model.format,
        success: (res) => {
          let value = `${this.path}.value[0]`
          this.$page.setData({ [value]: res.date })
        }
      })
    },

    // 打开datepicker
    handleTapEnd(event) {
      if (this.props.model.disabled) {
        return
      }
      if (!this.props.model.value[0]) {
        this.handleTapStart()
        return
      }
      dd.datePicker({
        format: this.props.model.format,
        success: (res) => {
          let value = `${this.path}.value[1]`
          if (new Date(res.date).getTime() < new Date(this.props.model.value[0]).getTime()) {
            this.$page.setData({ [value]: this.props.model.value[0] })
            return
          }
          this.$page.setData({ [value]: res.date })
        }
      })
    },

    // 清空开始时间
    clearStart() {
      if (this.props.model.disabled) {
        return
      }
      if (this.props.model.value[1]) {
        this.clearEnd()
        return
      }
      let value = `${this.path}.value[0]`
      this.$page.setData({ [value]: '' })
    },

    // 清空结束时间
    clearEnd() {
      if (this.props.model.disabled) {
        return
      }
      let value = `${this.path}.value[1]`
      this.$page.setData({ [value]: '' })
    },

    // 初始化model的属性
    init(model) {
      // input对象
      let interval = {
        label: '',
        disabled: false,
        necessary: false,
        format: 'yyyy-MM-dd',
        placeholder: ['开始时间', '结束时间']
      }
      // 处理默认值
      if (Array.isArray(model.value)) {
        let arr = []
        for (let i = 0; i < 2; i++) {
          if (model.value[i]) {
            arr.push(util.formatDate(model.format || 'yyyy-MM-dd', new Date(model.value[i])))
          } else {
            arr.push('')
          }
        }
        model.value = arr
      } else {
        model.value = ['', '']
      }
      // 补全属性
      this.$page.setData({
        [this.path]: Object.assign(interval, model, this.initValidate(model))
      })
    },

    // 校验方法
    validate() {
      let m = this.props.model
      let o = this.initValidate(m)
      if (m.fid) {
        getApp().emitter.emit(`${m.fid}`, Object.assign({ ...m }, o))
      }
      // 判断是否变化
      if (m.status === o.status && m.notice === o.notice) {
        return
      }
      let s = `${this.path}.status`
      let n = `${this.path}.notice`
      this.$page.setData({
        [s]: o.status,
        [n]: o.notice
      })
    },

    // 初始化时的校验方法
    initValidate(m) {
      // 校验状态码、校验错误提示
      let o = { status: '', notice: '' }
      // 校验必填
      if (m.necessary) {
        if (!m.value[0] || !m.value[1]) {
          o.status = 'error'
          o.notice = '不能为空'
        } else {
          o.status = this.props.onValidate(m.value) ? 'success' : 'error'
          o.notice = this.notice
        }
      } else {
        if (m.value) {
          o.status = this.props.onValidate(m.value) ? 'success' : 'error'
          o.notice = this.notice
        }
      }
      return o
    }
  }
})