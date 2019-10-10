import listPage from '/src/render/listPage'

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
        label: '耗材名称',
        key: 'cons_name'
      },
      {
        path: 'filter[1]',
        label: '耗材编号',
        key: 'cons_code'
      }
    ]
  },

  // 业务对象
  bizObj: {
    // 请求地址
    url: '/business/inventory',
    // 模板名称
    template: 'inventory',
    // 新增，查看，编辑时跳转路由
    form: '/pages/hy/base/inventory/form/index'
  }
})