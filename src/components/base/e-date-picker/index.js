import util from '/src/libs/util.js'
import mount from '../mixins/mount.js'
import validate from '../mixins/validate.js'
import clear from '../mixins/clear.js'

Component({
  mixins: [mount, validate, clear],

  props: {
    model: {},
    // 默认校验方法
    onValidate: () => true
  },

  methods: {
    // 打开datepicker
    handleTap(event) {
      if (this.props.model.disabled) {
        return
      }
      dd.datePicker({
        format: this.props.model.format,
        success: (res) => {
          let value = `${this.path}.value`
          this.$page.setData({
            [value]: res.date
          })
        }
      })
    },

    // 初始化model的属性
    init(model) {
      // datePicker对象
      let datePicker = {
        value: model.default && !model.value ? util.formatDate(model.format || 'yyyy-MM-dd', new Date()) : '',
        label: '',
        disabled: false,
        necessary: false,
        icon: 'calendar',
        format: 'yyyy-MM-dd',
        placeholder: model.necessary ? '必填' : '',
        default: model.default ? model.default : false
      }
      // 处理默认值
      if (model.value) {
        model.value = util.formatDate(model.format || 'yyyy-MM-dd', new Date(model.value))
      }
      // 补全属性
      this.$page.setData({
        [this.path]: Object.assign(datePicker, model, this.initValidate(model))
      })
    }
  }
})