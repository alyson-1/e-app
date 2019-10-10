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
    // 清空
    clear() {
      if (this.props.model.disabled && !this.props.model.gps) {
        return
      }
      let value = `${this.path}.value`
      this.$page.setData({ [value]: '' })
    },

    // 定位方法
    position() {
      if (this.props.model.gps === false) {
        return
      }
      dd.getLocation({
        type: 2,
        success: (res) => {
          let location = `${this.path}.location`
          let value = `${this.path}.value`
          this.$page.setData({
            [location]: res,
            [value]: res.address
          })
        },
        fail: (err) => {
          util.ddToast({ type: 'fail', text: '自动定位失败，请手动定位或输入地址' })
          console.error(err)
        }
      })
    },

    // 输入事件同步value
    handleInput: util.debounce(function(event) {
      let value = `${this.path}.value`
      this.$page.setData({
        [value]: event.detail.value
      })
    }, 500),

    // 设置焦点
    handleTap() {
      if (this.props.model.disabled && !this.props.model.value) {
        this.position()
      }
      let focus = `${this.path}.focus`
      this.$page.setData({
        [focus]: true
      })
    },

    // 手机键盘确认事件
    handleConfirm(event) { },

    // 获取焦点
    handleFocus(event) { },

    // 失去焦点
    handleBlur(event) {
      let focus = `${this.path}.focus`
      this.$page.setData({
        [focus]: false
      })
    },

    // 初始化model的属性
    init(model) {
      // address对象
      let address = {
        gps: true, // 能否定位
        value: '',
        label: '',
        focus: false,
        location: {},
        maxlength: 200,
        disabled: true,
        necessary: false,
        placeholder: model.necessary ? '必填' : ''
      }
      // 补全属性
      this.$page.setData({
        [this.path]: Object.assign(address, model, this.initValidate(model))
      })
      // 没有值时主动定位
      if (!model.value) {
        this.position()
      }
    }
  }
})