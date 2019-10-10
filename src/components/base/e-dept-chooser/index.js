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
    // 删除已选部门
    handleDelete(event) {
      let i = event.currentTarget.dataset.itemIndex
      let pickedDepts = `${this.path}.value`
      this.$page.$spliceData({
        [pickedDepts]: [i, 1]
      })
    },

    // 打开部门界面
    handleAdd() {
      if (this.props.model.disabled) {
        return
      }
      dd.chooseDepartments({
        title: `选择${this.props.model.label}`,
        multiple: this.props.model.multiple,
        limitTips: `最多选择${this.props.model.max}个部门`,
        maxDepartments: this.props.model.max,
        //已选部门
        pickedDepartments: this.props.model.value.map(row => row.id),
        //不可选部门
        disabledDepartments: this.props.model.disabledDepts,
        //必选部门（不可取消选中状态）
        requiredDepartments: this.props.model.requiredDepts,
        permissionType: "GLOBAL",
        success: (res) => {
          let pickedDepts = `${this.path}.value`
          this.$page.$spliceData({
            [pickedDepts]: [0, this.props.model.value.length, ...res.departments]
          })
        },
        fail: (err) => {
          console.error(err)
        }
      })
    },

    // 初始化model的属性
    init(model) {
      // dept-chooser对象
      let deptChooser = {
        max: 100,
        value: [],
        label: '',
        multiple: true,
        disabled: false,
        necessary: false,
        disabledDepts: [],
        requiredDepts: [],
        placeholder: model.necessary ? '必填' : ''
      }
      // 补全属性
      this.$page.setData({
        [this.path]: Object.assign(deptChooser, model, this.initValidate(model))
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