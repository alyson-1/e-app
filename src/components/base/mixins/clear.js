export default {
  methods: {
    // 清空方法，适用于某些非输入组件如单选、搜索等，一般为长按清空
    clear() {
      if (this.props.model.disabled) {
        return
      }
      let value = `${this.path}.value`
      this.$page.setData({ [value]: '' })
    }
  }
}