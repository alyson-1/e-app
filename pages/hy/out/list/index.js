import listPage from '/src/render/listPage'
import http from '/src/http/index.js'
import util from '/src/libs/util.js'

listPage({
  // 禁止移动端的按钮
  btnPos: { normal: -1, edit: -1 },

  // 搜索框
  searchBar: {
    bindkey: 'doc_number',
    placeholder: '搜索领用单号'
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
        label: '领用部门',
        key: 'stockout_dept',
        component: 'e-dept-chooser',
        max: 1
      },
      {
        path: 'filter[2]',
        label: '领用日期',
        key: 'doc_date',
        component: 'e-interval',
      },
      {
        path: 'filter[3]',
        label: '领用单号',
        key: 'doc_number'
      }
    ]
  },

  // 过滤前的处理
  beforeFilter(filter) {
    if (filter.doc_status) {
      filter.doc_status = filter.doc_status.value
    }
    if (filter.stockout_dept) {
      filter.stockout_dept = filter.stockout_dept[0].name
    }
  },

  // 业务对象
  bizObj: {
    // 请求地址
    url: '/business/stockout',
    // 模板名称
    template: 'out',
    // 新增，查看，编辑时跳转路由
    form: '/pages/hy/out/form/index'
  },

  // 列表加载完成触发，每次加载都触发一次，参数为返回数据
  afterLoad(data) {
    data.items.map(item => {
      item.stockout_person = item.stockout_person ? [JSON.parse(item.stockout_person)] : []
      item.stockout_dept = item.stockout_dept ? [JSON.parse(item.stockout_dept)] : []
      return item
    })
    return Promise.resolve()
  },

  methods: {
    // 删除
    handleListDelete(btn, checkedArray) {
      if (!checkedArray.length) {
        util.ddToast({ type: 'fail', text: '请先选择需要删除的领用单' })
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
                util.ddToast({ type: 'success', text: `${array.length}张领用单删除成功` })
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