export default {
  didMount() {
    let m = this.props.model
    // 配置path
    this.path = m.path !== undefined ? m.path : ''
    if (m.sfi !== undefined) {
      this.path = `bizObj[${m.ci}].children[${m.sfi}][${m.sci}]`
    } else if (m.ci !== undefined) {
      this.path = `bizObj[${m.ci}]`
    }
    // 保存业务对象notice
    this.notice = m.notice !== undefined ? m.notice : m.necessary ? '不能为空' : ''
    // 初始化，补全属性
    this.init(m)
  }
}