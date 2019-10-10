import validate from '../mixins/validate.js'
import mount from '../mixins/mount.js'

Component({
  mixins: [mount, validate],

  props: {
    model: {},
    onValidate: () => true
  },

  methods: {
    // 设置value
    handleChange(event) {
      let value = `${this.path}.value`
      this.$page.setData({
        [value]: event.detail.value
      })
    },

    // 补充params的属性
    init(model) {
      // progress对象
      let progressBar = {
        step: 1, // 间隔
        min: 0, // 最小值
        max: 100, // 最大值
        value: 0,
        unit: '%', // 单位
        label: '',
        notice: '',
        disabled: false,
        showValue: false, // 是否显示value
        handleColor: '#fff', // 拖动按钮颜色
        activeColor: '#108ee9', // 激活拖动条颜色
        backgroundColor: '#ddd', // 拖动条颜色
      }
      // 补全属性
      this.$page.setData({
        [this.path]: Object.assign(progressBar, model, this.initValidate(model))
      })
    }
  }
})