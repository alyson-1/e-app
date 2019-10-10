import listPage from '/src/render/listPage'

listPage({
  // 搜索框
  searchBar: {
    bindkey: 'wh_name',
    placeholder: '搜索仓库名称'
  },

  // 过滤配置
  filter() {
    return [
      {
        path: 'filter[0]',
        label: '仓库名称',
        key: 'wh_name'
      },
      {
        path: 'filter[1]',
        label: '仓库编号',
        key: 'wh_code'
      }
    ]
  },

  // 业务对象
  bizObj: {
    // 请求地址
    url: '/business/warehouse',
    // 模板名称
    template: 'wh',
    // 新增，查看，编辑时跳转路由
    form: '/pages/hy/base/wh/form/index'
  }
})