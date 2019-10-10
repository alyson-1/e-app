import formPage from '/src/render/formPage'

formPage({
  // 禁止修改
  disabled: true,

  // 业务对象
  bizObj: [
    {
      label: '耗材编号',
      key: 'cons_code',
      component: 'e-input'
    },
    {
      label: '耗材名称',
      key: 'cons_name',
      component: 'e-input'
    },
    {
      label: '所属分类',
      key: 'item_name',
      component: 'e-input'
    },
    {
      label: '库存量',
      key: 'qty',
      component: 'e-input'
    },
    {
      label: '仓库',
      key: 'wh_name',
      component: 'e-input'
    },
    {
      label: '规格型号',
      key: 'cons_standard',
      component: 'e-input'
    },
    {
      label: '计量单位',
      key: 'cons_unit',
      component: 'e-input'
    },
    {
      label: '最新单价',
      key: 'unit_price',
      component: 'e-input'
    },
    {
      label: '备注',
      key: 'remark',
      component: 'e-text-area'
    }
  ]
})