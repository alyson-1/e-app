import listPage from '/src/render/listPage'
import http from '/src/http/index.js'
import util from '/src/libs/util.js'

listPage({
  // 搜索框
  searchBar: {
    bindkey: 'cons_name',
    placeholder: '搜索耗材名称'
  },

  // 过滤配置
  filter() {
    return [
      {
        path: 'filter[0]',
        label: '所属分类',
        key: 'item_name',
        bindkey: 'item_name'
      },
      {
        path: 'filter[1]',
        label: '耗材名称',
        key: 'cons_name'
      },
      {
        path: 'filter[2]',
        label: '耗材编号',
        key: 'cons_code'
      }
    ]
  },

  // 业务对象
  bizObj: {
    // 请求地址
    url: '/business/consumables',
    // 模板名称
    template: 'cons',
    // 新增，查看，编辑时跳转路由
    form: '/pages/hy/base/cons/form/index'
  },

  // 初始化完成，请求过滤条件中的耗材分类树
  onReady() {
    let options = { url: '/business/item-class' }
    http.get(options).then(res => {
      if (res.status === 0) {
        this.setData({
          'filter[0].tree': res.data[0].children
        })
      } else {
        util.ddToast({ type: 'fail', text: res.message || '耗材分类请求失败' })
      }
    })
  },

  // 过滤前的处理
  beforeFilter(filter) {
    if (filter.item_name) {
      filter.item_name = filter.item_name.item_name
    }
  }
})