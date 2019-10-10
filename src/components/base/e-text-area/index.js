import util from '/src/libs/util.js'
import mount from '../mixins/mount.js'
import validate from '../mixins/validate.js'

Component({
  mixins: [mount, validate],

  props: {
    model: {},
    onValidate: () => true
  },

  methods: {
    // 输入事件同步value
    handleInput: util.debounce(function(event) {
      let value = `${this.path}.value`
      this.$page.setData({
        [value]: event.detail.value
      })
    }, 500),

    // 设置焦点
    handleTap() {
      if (this.props.model.disabled) {
        return
      }
      let focus = `${this.path}.focus`
      this.$page.setData({
        [focus]: true
      })
    },

    // 获取焦点后触发
    handleFocus(event) { },

    // 点击键盘(手机)确认键/回车键
    handleConfirm(event) { },

    // 失去焦点
    handleBlur(event) {
      let focus = `${this.path}.focus`
      this.$page.setData({
        [focus]: false
      })
    },

    // 补充params的属性
    init(model) {
      // textArea对象
      let textArea = {
        value: '',
        label: '',
        focus: false,
        maxlength: -1,
        disabled: false,
        necessary: false,
        autoHeight: true,
        placeholder: model.necessary ? '必填' : ''
      }
      // 补全属性
      this.$page.setData({
        [this.path]: Object.assign(textArea, model, this.initValidate(model))
      })
    }
  }
})