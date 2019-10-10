import validate from '../mixins/validate.js'
import mount from '../mixins/mount.js'
import clear from '../mixins/clear.js'

Component({
  mixins: [mount, validate, clear],

  props: {
    model: {},
    // 默认校验函数
    onValidate: () => true
  },

  methods: {
    // 点击选项事件
    handleChange(event) {
      let i = event.detail.value
      let value = `${this.path}.value`
      let index = `${this.path}.index`
      this.$page.setData({
        [value]: this.props.model.array[i],
        [index]: i
      })
    },

    // 补充params的属性
    init(model) {
      // picker
      let picker = {
        index: -1, // 当前选择的选项索引
        array: [], // 选项
        value: '',
        label: '',
        bindkey: '',
        disabled: false,
        necessary: false,
        placeholder: model.necessary ? '必填' : ''
      }
      // 补全属性
      this.$page.setData({
        [this.path]: Object.assign(picker, model, this.initValidate(model))
      })
    }
  }
})