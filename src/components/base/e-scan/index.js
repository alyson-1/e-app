import validate from '../mixins/validate.js'
import mount from '../mixins/mount.js'
import util from '/src/libs/util.js'

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
      if (this.props.model.disabled && !this.props.model.camera) {
        return
      }
      let value = `${this.path}.value`
      this.$page.setData({
        [value]: ''
      })
    },

    // 输入事件同步value
    handleInput: util.debounce(function(event) {
      let value = `${this.path}.value`
      this.$page.setData({
        [value]: event.detail.value
      })
    }, 500),

    // 点击事件
    handleTap() {
      if (this.props.model.disabled && !this.props.model.value) {
        this.handleScan()
      }
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

    // 扫码
    handleScan(event) {
      if (!this.props.model.camera) {
        return
      }
      dd.scan({
        type: this.props.model.scanType,
        success: (res) => {
          this.handleInput({ detail: { value: res.code } })
        }
      })
    },

    // 初始化属性
    init(model) {
      // scan对象
      let scan = {
        value: '',
        label: '',
        camera: true, // 可扫描
        focus: false,
        maxlength: 200,
        scanType: 'qr',
        disabled: true,
        necessary: false,
        placeholder: model.necessary ? '必填' : ''
      }
      // 补全属性
      this.$page.setData({
        [this.path]: Object.assign(scan, model, this.initValidate(model))
      })
    }
  }
})