import formPage from '/src/render/formPage'

formPage({
  // 提交地址
  url: '/business/warehouse',

  // 业务对象
  bizObj: [
    {
      label: '仓库编号',
      key: 'wh_code',
      component: 'e-input',
      necessary: true,
      maxlength: 20
    },
    {
      label: '仓库名称',
      key: 'wh_name',
      component: 'e-input',
      necessary: true,
      maxlength: 20
    },
    {
      label: '备注',
      key: 'remark',
      component: 'e-text-area',
      maxlength: 200
    }
  ]
})