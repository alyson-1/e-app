import util from '/src/libs/util.js'

let app = getApp()

export default {
  // 更新后进行校验
  didUpdate(prevProps, prevData) {
    if (!util.equal(prevProps.model.value, this.props.model.value)) {
      this.validate()
    }
  },

  methods: {
    // 校验方法
    validate() {
      let m = this.props.model
      let o = this.initValidate(m)
      if (m.fid) {
        app.emitter.emit(`${m.fid}`, Object.assign({ ...m }, o))
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
        if (!m.value) {
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
}