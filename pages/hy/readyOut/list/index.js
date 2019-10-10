import listPage from '/src/render/listPage'

listPage({
  // 搜索框
  searchBar: {
    bindkey: 'cons_name',
    placeholder: '搜索耗材名称'
  },

  // 业务对象
  bizObj: {
    // 请求地址
    url: '/business/consumables',
    // 模板名称
    template: 'cons',
    // 新增，查看，编辑时跳转路由
    form: '/pages/hy/base/cons/form/index'
  }
})