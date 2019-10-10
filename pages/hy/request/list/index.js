import listPage from '/src/render/listPage'
import http from '/src/http/index.js'
import util from '/src/libs/util.js'

listPage({
  // 自定义数据
  data() {
    return {
      receiveForm: [
        {
          path: 'receiveForm[0]',
          label: '仓库',
          bindkey: 'wh_name',
          necessary: true
        }
      ]
    }
  },

  // 搜索框
  searchBar: {
    bindkey: 'doc_number',
    placeholder: '搜索请购单号'
  },

  // 过滤配置
  filter() {
    return [
      {
        path: 'filter[0]',
        label: '单据状态',
        key: 'doc_status',
        bindkey: 'label',
        array: [
          { label: '草稿', value: 'draft' },
          { label: '审核中', value: 'processing' },
          { label: '同意', value: 'agree' },
          { label: '拒绝', value: 'refuse' }
        ]
      },
      {
        path: 'filter[1]',
        label: '申请部门',
        key: 'apply_dept',
        component: 'e-dept-chooser',
        max: 1
      },
      {
        path: 'filter[2]',
        label: '请购日期',
        key: 'doc_date',
        component: 'e-interval',
      },
      {
        path: 'filter[3]',
        label: '请购单号',
        key: 'doc_number'
      }
    ]
  },

  // 过滤前的处理
  beforeFilter(filter) {
    if (filter.doc_status) {
      filter.doc_status = filter.doc_status.value
    }
    if (filter.apply_dept) {
      filter.apply_dept = filter.apply_dept[0].name
    }
  },

  // 业务对象
  bizObj: {
    // 请求地址
    url: '/business/por',
    // 模板名称
    template: 'request',
    // 新增，查看，编辑时跳转路由
    form: '/pages/hy/request/form/index'
  },

  // 加载完成
  onReady() {
    this.getWhs()
  },

  // 列表加载完成触发，每次加载都触发一次，参数为返回数据
  afterLoad(data) {
    data.items.map(item => {
      item.apply_person = item.apply_person ? [JSON.parse(item.apply_person)] : []
      item.apply_dept = item.apply_dept ? [JSON.parse(item.apply_dept)] : []
      return item
    })
    return Promise.resolve()
  },

  methods: {
    // 获取仓库数据
    getWhs() {
      let options = {
        url: '/business/warehouse',
        params: { pageable: true, page: 1, limit: 10000, idField: 'id', sort: 'desc', orderBy: 'create_on' }
      }
      http.get(options).then(res => {
        if (res.status === 0) {
          this.setData({ 'receiveForm[0].array': res.data.items })
        } else {
          util.ddToast({ type: 'fail', text: res.message || '获取仓库列表失败' })
        }
      })
    },

    // 新增跳转
    handleOpenAdd() {
      if (!this.data.bizObj.form) {
        return
      }
      let list = { lid: this.lid }
      dd.navigateTo({
        url: `${this.data.bizObj.form}?list=${JSON.stringify(list)}`
      })
    },

    // 将请购单转为领用单
    handleReceive(btn, checkedArray) {
      if (!checkedArray.length) {
        util.ddToast({ type: 'fail', text: '请先选择需要转领用的请购单' })
        return
      }
      let array = []
      for (let i = 0; i < checkedArray.length; i++) {
        if (checkedArray[i].doc_status === 'agree') {
          array.push(checkedArray[i].id)
        }
      }
      if (!array.length) {
        util.ddToast({ type: 'fail', text: '没有满足领用条件的请购单' })
        return
      }
      let dialogReceive = util.getComponentById('receiveForm')
      dialogReceive.confirm({
        title: '领用确认',
        success: () => {
          if (!util.baseValidate(this.data.receiveForm)) {
            return false
          }
          let options = {
            url: `/business/stockout-wv?warehouseId=${this.data.receiveForm[0].value.id}`,
            params: array
          }
          http.post(options).then(res => {
            if (res.status === 0) {
              util.ddToast({ type: 'success', text: `${array.length}张请购单转领用成功` })
              this.refresh()
              this.checkboxInvisible()
            } else {
              util.ddToast({ type: 'fail', text: res.message || '转领用失败' })
            }
          })
        }
      })
    },

    // 将请购单转为采购单
    handlePo(btn, checkedArray) {
      if (!checkedArray.length) {
        util.ddToast({ type: 'fail', text: '请先选择需要转采购的请购单' })
        return
      }
      dd.confirm({
        title: '温馨提示',
        content: `确认将已勾选的${checkedArray.length}张请购单转为采购单吗?`,
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        success: (res) => {
          if (res.confirm) {
            let array = []
            for (let i = 0; i < checkedArray.length; i++) {
              if (checkedArray[i].doc_status === 'agree') {
                array.push(checkedArray[i].id)
              }
            }
            let options = { url: '/business/build-po', params: array }
            http.post(options).then(res => {
              if (res.status === 0) {
                util.ddToast({ type: 'success', text: `${array.length}张请购单转采购单成功` })
                this.refresh()
                this.checkboxInvisible()
              } else {
                util.ddToast({ type: 'fail', text: res.message || '转采购单失败' })
              }
            })
          }
        }
      })
    },

    // 删除
    handleListDelete(btn, checkedArray) {
      if (!checkedArray.length) {
        util.ddToast({ type: 'fail', text: '请先选择需要删除的请购单' })
        return
      }
      dd.confirm({
        title: '温馨提示',
        content: `确认删除已勾选的${checkedArray.length}项吗?`,
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        success: (res) => {
          if (res.confirm) {
            let array = []
            for (let i = 0; i < checkedArray.length; i++) {
              if (checkedArray[i].doc_status === 'draft') {
                array.push(checkedArray[i].id)
              }
            }
            let options = { url: this.data.bizObj.url, params: array }
            http.delete(options).then(res => {
              if (res.status === 0) {
                util.ddToast({ type: 'success', text: `${array.length}张请购单删除成功` })
                this.refresh()
                this.checkboxInvisible()
              } else {
                util.ddToast({ type: 'fail', text: res.message || '删除失败' })
              }
            })
          }
        }
      })
    }
  }
})