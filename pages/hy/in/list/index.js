import listPage from '/src/render/listPage'
import http from '/src/http/index.js'
import util from '/src/libs/util.js'

listPage({
  // 禁止移动端的按钮
  btnPos: { normal: -1, edit: -1 },

  // 搜索框
  searchBar: {
    bindkey: 'doc_number',
    placeholder: '搜索入库单号'
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
        label: '供应商',
        key: 'supplier_name',
        bindkey: 'name'
      },
      {
        path: 'filter[2]',
        label: '所属分类',
        key: 'item_name',
        bindkey: 'item_name'
      },
      {
        path: 'filter[3]',
        label: '订单编号',
        key: 'doc_number'
      }
    ]
  },

  // 过滤前的处理
  beforeFilter(filter) {
    if (filter.doc_status) {
      filter.doc_status = filter.doc_status.value
    }
    if (filter.supplier_name) {
      filter.supplier_name = filter.supplier_name.name
    }
    if (filter.item_name) {
      filter.item_name = filter.item_name.item_name
    }
  },

  // 加载完成，请求仓库，请求过滤条件中的耗材分类树
  onReady() {
    this.getItemClass()
    this.getSupplier()
  },

  // 业务对象
  bizObj: {
    // 请求地址
    url: '/business/stockin',
    // 模板名称
    template: 'in',
    // 新增，查看，编辑时跳转路由
    form: '/pages/hy/in/form/index'
  },

  methods: {
    // 获取供应商
    getSupplier() {
      let options = {
        url: '/business/supplier',
        params: { pageable: true, page: 1, limit: 10000, idField: 'id', sort: 'desc', orderBy: 'create_on' }
      }
      http.get(options).then(res => {
        if (res.status === 0) {
          this.setData({
            'filter[1].array': res.data.items
          })
        } else {
          util.ddToast({ type: 'fail', text: res.message || '获取供应商失败' })
        }
      })
    },

    // 获取分类树
    getItemClass() {
      let options = { url: '/business/item-class' }
      http.get(options).then(res => {
        if (res.status === 0) {
          this.setData({
            'filter[2].array': res.data[0].children
          })
        } else {
          util.ddToast({ type: 'fail', text: res.message || '耗材分类请求失败' })
        }
      })
    },

    // 删除
    handleListDelete(btn, checkedArray) {
      if (!checkedArray.length) {
        util.ddToast({ type: 'fail', text: '请先选择需要删除的入库单' })
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
                util.ddToast({ type: 'success', text: `${array.length}张入库单删除成功` })
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