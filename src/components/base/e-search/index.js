import validate from '../mixins/validate.js'
import mount from '../mixins/mount.js'
import clear from '../mixins/clear.js'

let app = getApp()

Component({
  mixins: [mount, validate, clear],

  props: {
    model: {},
    onValidate: () => true
  },

  // 挂载
  didMount() {
    app.emitter.on(`C${this.$page.$viewId + this.$id}`, this.handleSelect, this)
  },

  // 事件销毁
  didUnmount() {
    app.emitter.removeListener(`C${this.$page.$viewId + this.$id}`, this.handleSelect, this)
  },

  methods: {
    // 点击选项事件
    handleSelect(event) {
      let value = `${this.path}.value`
      this.$page.setData({
        [value]: event
      })
    },

    // 跳转到搜索页面
    handleTap(event) {
      if (this.props.model.disabled) {
        return
      }
      let esearch = JSON.stringify({ cid: `C${this.$page.$viewId + this.$id}`, filter: this.props.model.filter })
      dd.navigateTo({
        url: `${this.props.model.bindlist}?esearch=${esearch}`
      })
    },

    // 初始化属性
    init(model) {
      // search对象
      let search = {
        value: '',
        label: '',
        filter: {}, // 过滤条件
        bindkey: '', // 要显示的key
        bindlist: '', // 目标列表，路径
        disabled: false,
        necessary: false,
        placeholder: model.necessary ? '必填' : ''
      }
      // 补全属性
      this.$page.setData({
        [this.path]: Object.assign(search, model, this.initValidate(model))
      })
    }
  }
})