import util from '/src/libs/util.js'
import mount from '../mixins/mount.js'
import validate from '../mixins/validate.js'

Component({
  mixins: [mount, validate],

  props: {
    model: {},
    // 默认校验方法
    onValidate: () => true
  },

  methods: {
    // 输入事件同步value
    handleInput: util.debounce(function(event) {
      let value = `${this.path}.value`
      this.$page.setData({
        [value]: this.props.model.number ? Number(event.detail.value) || 0 : event.detail.value
      })
    }, 500),

    // 设置焦点
    handleTap() {
      let focus = `${this.path}.focus`
      this.$page.setData({
        [focus]: true
      })
    },

    // 获取焦点事件
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

    // 清空输入并获取焦点
    handleClear(event) {
      let value = `${this.path}.value`
      let focus = `${this.path}.focus`
      this.$page.setData({
        [value]: '',
        [focus]: true
      })
    },

    // 初始化model的属性
    init(model) {
      // input对象
      let input = {
        value: '',
        label: '',
        number: false,
        focus: false,
        maxlength: 200,
        password: false,
        disabled: false,
        necessary: false,
        placeholder: model.necessary ? '必填' : ''
      }
      // 补全属性
      this.$page.setData({
        [this.path]: Object.assign(input, model, this.initValidate(model))
      })
    }
  }
})