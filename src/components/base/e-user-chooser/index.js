import mount from '../mixins/mount.js'
import util from '/src/libs/util.js'

Component({
  mixins: [mount],

  props: {
    model: {},
    // 默认校验方法
    onValidate: () => true
  },

  // 更新后进行校验
  didUpdate(prevProps, prevData) {
    if (!util.equal(prevProps.model.value, this.props.model.value)) {
      this.validate()
    }
  },

  methods: {
    // 删除已选人
    handleDelete(event) {
      if (this.props.model.disabled) {
        return
      }
      let i = event.target.dataset.i
      let pickedUsers = `${this.path}.value`
      this.$page.$spliceData({
        [pickedUsers]: [i, 1]
      })
    },

    // 打开选人界面
    handleAdd(event) {
      if (this.props.model.disabled) {
        return
      }
      dd.complexChoose({
        title: `选择${this.props.model.label}`,
        multiple: this.props.model.multiple,
        limitTips: `最多选择${this.props.model.max}个人`,
        maxUsers: this.props.model.max,
        // 已选
        pickedUsers: this.props.model.value.map(row => row.userId),
        // 不可选
        disabledUsers: this.props.model.disabledUsers,
        // 必选
        requiredUsers: this.props.model.requiredUsers,
        permissionType: "GLOBAL",
        responseUserOnly: true,
        startWithDepartmentId: 0,
        success: (res) => {
          let pickedUsers = `${this.path}.value`
          this.$page.$spliceData({
            [pickedUsers]: [0, this.props.model.value.length, ...res.users]
          })
        },
        fail: (err) => {
          console.error(err)
        }
      })
    },

    // 初始化属性
    init(model) {
      let value = []
      if (model.default && !model.value && getApp().globalData.userInfo) {
        let userInfo = getApp().globalData.userInfo
        value.push({
          userId: userInfo.dd_user_info.Userid,
          name: userInfo.dd_user_info.Name,
          avatar: userInfo.dd_user_info.Avatar
        })
      }
      // userChooser对象
      let userChooser = {
        max: 100,
        value: value,
        label: '',
        default: false,
        multiple: true,
        disabled: false,
        necessary: false,
        type: 'complete', // 显示模式，默认完整模式，适合同时选择多人，占位较大，显示头像；精简模式（simple）只显示名字
        disabledUsers: [],
        requiredUsers: [],
        placeholder: model.necessary ? '必填' : ''
      }
      // 补全属性
      this.$page.setData({
        [this.path]: Object.assign(userChooser, model, this.initValidate(model))
      })
    },

    // 无效事件
    void() { },

    // 校验方法
    validate() {
      let m = this.props.model
      let o = this.initValidate(m)
      if (m.fid) {
        getApp().emitter.emit(`${m.fid}`, Object.assign({ ...m }, o))
      }
      // 判断是否变化
      if (m.status === o.status && m.notice === o.notice) {
        return
      }
      let s = `${this.path}.status`
      let n = `${this.path}.notice`
      this.$page.setData({
        [s]: o.status,
        [n]: o.notice
      })
    },

    // 初始化时的校验方法
    initValidate(m) {
      // 校验状态码、校验错误提示
      let o = { status: '', notice: '' }
      // 校验必填
      if (m.necessary) {
        if (!m.value || (m.value && !m.value.length)) {
          o.status = 'error'
          o.notice = '不能为空'
        } else {
          o.status = this.props.onValidate(m.value) ? 'success' : 'error'
          o.notice = this.notice
        }
      } else {
        if (m.value) {
          o.status = this.props.onValidate(m.value) ? 'success' : 'error'
          o.notice = this.notice
        }
      }
      return o
    }
  }
})