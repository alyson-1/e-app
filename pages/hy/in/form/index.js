import formPage from '/src/render/formPage'
import http from '/src/http/index.js'
import util from '/src/libs/util.js'

formPage({
  // 提交地址
  url: '/business/stockin',

  // 是否带有明细
  detail: true,

  // 权限按钮位置，移动端禁用
  btnPos: -1,

  // 移动端表单禁用
  disabled: true,

  // 业务对象
  bizObj: [
    {
      label: '入库单号',
      key: 'doc_number',
      component: 'e-input',
      disabled: true,
      placeholder: '系统自动生成'
    },
    {
      label: '入库日期',
      key: 'stockin_date',
      component: 'e-date-picker',
      default: true,
      disabled: true,
      format: 'yyyy-MM-dd'
    },
    {
      label: '类别',
      key: 'item_name',
      component: 'e-input',
      disabled: true
    },
    {
      label: '供应商',
      key: 'supplier_name',
      component: 'e-input',
      disabled: true
    },
    {
      label: '仓库',
      key: 'warehouse_id',
      component: 'e-input',
      disabled: true
    },
    {
      label: '状态',
      key: 'doc_status_text',
      component: 'e-input',
      disabled: true
    },
    {
      label: '备注',
      key: 'remark',
      component: 'e-text-area',
      maxlength: 200
    },
    {
      label: '耗材',
      key: 'children',
      component: 'e-subform',
      disabled: true,
      subform: [
        {
          label: '耗材名称',
          key: 'cons_name',
          component: 'e-input',
          disabled: true
        },
        {
          label: '规格型号',
          key: 'cons_standard',
          component: 'e-input',
          disabled: true
        },
        {
          label: '计量单位',
          key: 'cons_unit',
          component: 'e-input',
          disabled: true
        },
        {
          label: '入库数量',
          key: 'stockin_qty',
          component: 'e-input',
          number: true,
          necessary: true
        }
      ]
    }
  ],

  // 钩子函数-初始化前
  beforeOnLoad(query) {
    return new Promise((resolve, reject) => {
      if (this.list && this.list.data) {
        // 当前状态不可编辑
        if (this.list.data.id && this.list.data.doc_status !== 'draft') {
          this.setData({ disabled: true })
        }
        // 获取耗材明细
        http.get({ url: '/business/stockin-detail', params: { params: JSON.stringify({ pid: this.list.data.id }) } }).then(res => {
          if (res.status === 0) {
            this.list.data.children = res.data
            resolve()
          } else {
            util.ddToast({ type: 'success', text: res.message || '耗材明细请求失败' })
            resolve()
          }
        }).catch(err => { resolve() })
      } else { resolve() }
    })
  },

  methods: {
    // 审核
    handleCheck() {
      this.handlePost({
        url: '/business/stockin/agree',
        autoCheck: true,
        successText: '审核成功',
        failText: '审核失败'
      })
    }
  }
})