import listPage from '/src/render/listPage'

listPage({
  // 搜索框
  searchBar: {
    bindkey: 'name',
    placeholder: '搜索供应商名称'
  },

  // 过滤配置
  filter() {
    return [
      {
        path: 'filter[0]',
        label: '供应商名称',
        key: 'name'
      },
      {
        path: 'filter[1]',
        label: '供应商编号',
        key: 'code'
      },
      {
        path: 'filter[2]',
        label: '联系人',
        key: 'contact'
      },
      {
        path: 'filter[3]',
        label: '电话',
        key: 'tel'
      }
    ]
  },

  // 业务对象
  bizObj: {
    // 请求地址
    url: '/business/supplier',
    // 模板名称
    template: 'supplier',
    // 新增，查看，编辑时跳转路由
    form: '/pages/hy/base/supplier/form/index'
  }
})