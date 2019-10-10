import util from '/src/libs/util.js'
import http from '/src/http/index.js'

let app = getApp()

// 初始化业务对象方法
function initBizObj(bizObj, fid, list, disabled) {
  // 区分创建模式
  if (list.data) {
    return mode2(bizObj, fid, list.data, disabled)
  } else {
    return mode1(bizObj, fid, disabled)
  }
}

// 克隆基础表单组件方法
function cbo(obj, disabled) {
  let str = JSON.stringify(obj, (k, v) => {
    // 由于传递参数时不支持函数，将校验函数改成布尔类型（用于标记是否存在自定义校验函数）
    if (k === 'validate' && typeof v === 'function') { return true }
    return v
  })
  let c = JSON.parse(str)
  if (disabled) { c['disabled'] = true }
  return c
}

// 创建模式：新增
function mode1(bizObj, fid, disabled) {
  return bizObj.map((c, ci) => {
    if (c.component === 'e-subform' && c.subform && c.subform.length) {
      let newc = { ...cbo(c, disabled), ci: ci, fid: fid }
      newc.subform = c.subform.map((sc, sci) => { return { ...cbo(sc, disabled), ci: ci, fid: fid, sci: sci } })
      if (c.children && c.children.length) {
        newc.children = c.children.map((sf, sfi) => {
          return sf.map((sc, sci) => { return { ...cbo(sc, disabled), ci: ci, sfi: sfi, sci: sci, fid: fid } })
        })
      } else {
        newc.children = [c.subform.map((sc, sci) => { return { ...cbo(sc, disabled), ci: ci, fid: fid, sfi: 0, sci: sci } })]
      }
      return newc
    }
    return { ...cbo(c, disabled), ci: ci, fid: fid }
  })
}

// 创建模式：编辑
function mode2(bizObj, fid, data, disabled) {
  return bizObj.map((c, ci) => {
    if (c.component === 'e-subform' && c.subform && c.subform.length) {
      let newc = { ...cbo(c, disabled), ci: ci, fid: fid }
      newc.subform = c.subform.map((sc, sci) => { return { ...cbo(sc, disabled), ci: ci, fid: fid, sci: sci } })
      newc.subform.push({ key: 'id', ci: ci, fid: fid, sci: c.subform.length })
      newc.children = []
      if (data[newc.key] && data[newc.key].length) {
        for (let sfi = 0; sfi < data[newc.key].length; sfi++) {
          let sf = data[newc.key][sfi]
          newc.children.push(newc.subform.map((sc) => {
            let _sc = { ...sc, sfi: sfi }
            if (sf[_sc.key]) { _sc.value = sf[_sc.key] }
            return _sc
          }))
        }
      } else {
        newc.children = [newc.subform.map((sc) => { return { ...sc, sfi: 0 } })]
      }
      return newc
    }
    let _c = { ...cbo(c, disabled), ci: ci, fid: fid }
    if (data[_c.key] !== undefined && data[_c.key] !== null) {
      _c.value = data[_c.key]
    }
    return _c
  })
}

// 初始化校验函数合集
function initRules(f, fid) {
  // 校验函数集合
  let rules = []
  for (let i = 0; i < f.bizObj.length; i++) {
    let c = f.bizObj[i]
    if (c.validate && typeof c.validate === 'function') {
      rules.push({ fid: fid, key: c.key, validate: c.validate })
      continue
    }
    if (c.component === 'e-subform' && c.subform && c.subform.length) {
      for (let j = 0; j < c.subform.length; j++) {
        let sc = c.subform[j]
        if (sc.validate && typeof sc.validate === 'function') {
          rules.push({ fid: fid, key: sc.key, validate: sc.validate })
        }
      }
    }
  }
  return rules
}

// 初始化data
function initData(f) {
  if (typeof f.data === 'function') {
    return f.data()
  } else {
    return {}
  }
}

export default (f) => {
  return Page({
    data: {
      // 提交地址，表单保存
      url: f.url || '',
      // 权限标记，对应按钮position
      btnPos: f.btnPos !== undefined ? f.btnPos : 30,
      // 表单背景，默认透明
      background: f.background || 'rgba(0, 0, 0, 0)',
      // 表单提交格式，是否带有明细表，默认无
      detail: f.detail || false,
      // 表单组件是否禁用
      disabled: f.disabled || false,
      // 其他自定义数据
      ...initData(f)
    },

    // 加载
    async onLoad(query) {
      // 定义表单id
      this.fid = `F${this.$viewId}`
      // 获取对应列表的相关信息，包含列表id，数据和索引
      if (query.list) {
        this.list = JSON.parse(query.list)
      }
      // 获取页面菜单
      this.menu = await util.getMenu(this.route)
      // 初始化前函数
      if (f.beforeOnLoad) {
        await f.beforeOnLoad.apply(this, arguments)
      }
      // 设置业务对象
      this.setData({
        bizObj: initBizObj(f.bizObj, this.fid, this.list, this.data.disabled)
      }, () => {
        // 初始化后函数
        if (f.afterOnLoad) {
          f.afterOnLoad.apply(this, arguments)
        }
      })
      // 设置导航栏
      if (!f.navigationBar || !f.navigationBar.title) {
        f.navigationBar = Object.assign({ ...f.navigationBar }, { title: this.menu.menu_name })
      }
      util.setNavigationBar(f.navigationBar)
    },

    // 加载完成
    onReady() {
      // 监听表单change事件
      if (f.formChange) {
        app.emitter.on(this.fid, f.formChange, this)
      }
      // 执行业务onReady
      if (f.onReady) {
        f.onReady.apply(this, arguments)
      }
    },

    // 校验方法，返回一个数组，包含所有自定义校验函数
    onRules() {
      return initRules(f, this.fid)
    },

    // 关闭
    onUnload() {
      // 销毁表单change事件
      if (f.formChange) {
        app.emitter.removeListener(this.fid, f.formChange, this)
      }
    },

    // 提交方法
    async saveForm() {
      // 自动校验
      if (!this.handleValidate()) {
        return
      }
      // 格式化提交对象
      let data = this.formatForm()
      // 提交前钩子函数
      if (f.beforeSubmit) {
        await f.beforeSubmit.apply(this, [data])
      }
      // 提交对象
      let params = this.list.data ? Object.assign(this.list.data, data) : data
      // 配置提交参数
      let options = {
        url: this.data.url,
        params: this.data.detail ? params : [params]
      }
      http.post(options).then(res => {
        if (res.status === 0) {
          util.ddToast({ type: 'success', text: '保存成功' })
          // 刷新列表、返回
          app.emitter.emit(this.list.lid, { type: 'refresh' })
          dd.navigateBack({ delta: 1 })
        } else {
          util.ddToast({ type: 'fail', text: res.message || '保存失败' })
        }
      })
    },

    // post方法
    async handlePost(config) {
      // 自动校验
      if (!config.autoCheck ? false : !this.handleValidate()) {
        return
      }
      // 格式化提交对象
      let data = this.formatForm()
      // 提交前钩子函数
      if (f.beforeSubmit) {
        await f.beforeSubmit.apply(this, [data])
      }
      // 提交对象
      let params = this.list.data ? Object.assign(this.list.data, data) : data
      // 配置提交参数
      let options = {
        url: config.url ? config.url : this.data.url,
        params: this.data.detail ? params : [params]
      }
      http.post(options).then(res => {
        if (res.status === 0) {
          util.ddToast({ type: 'success', text: config.successText ? config.successText : '保存成功' })
          // 刷新列表
          if (config.refresh !== undefined ? config.refresh : true) {
            app.emitter.emit(this.list.lid, { type: 'refresh' })
          }
          // 返回
          if (config.return !== undefined ? config.return : true) {
            dd.navigateBack({ delta: 1 })
          }
        } else {
          util.ddToast({ type: 'fail', text: res.message || config.failText ? config.failText : '保存失败' })
        }
      })
    },

    // 校验提交数据
    handleValidate() {
      // 用于记录toast文本
      let key = ''
      for (let i = 0; i < this.data.bizObj.length; i++) {
        let c = this.data.bizObj[i]
        key = c.label
        if (c.component === 'e-subform') {
          for (let j = 0; j < c.children.length; j++) {
            let sf = c.children[j]
            for (let k = 0; k < sf.length; k++) {
              if (sf[k].status === 'error') {
                key += `-${j + 1}`
                util.ddToast({ type: 'fail', text: `${sf[k].label}（${key}）${sf[k].notice}` })
                return false
              }
            }
          }
        } else {
          if (c.status === 'error') {
            util.ddToast({ type: 'fail', text: key + c.notice })
            return false
          }
        }
      }
      return true
    },

    // 整理出可提交的数据
    formatForm() {
      // 整理子表组件函数
      let formatKV = function(arr) {
        let o = {}
        for (let i = 0; i < arr.length; i++) {
          o[arr[i].key] = util.cloneDeep(arr[i].value)
        }
        return o
      }
      let data = {}
      for (let k = 0; k < this.data.bizObj.length; k++) {
        let c = this.data.bizObj[k]
        if (c.component === 'e-subform') {
          data[c.key] = c.children.map(sf => { return formatKV(sf) })
        } else {
          data[c.key] = util.cloneDeep(c.value)
        }
      }
      return data
    },

    // 展开其他方法
    ...f.methods
  })
}