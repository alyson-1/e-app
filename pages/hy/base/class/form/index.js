import formPage from '/src/render/formPage'
import http from '/src/http/index.js'
import util from '/src/libs/util.js'

formPage({
  // 提交地址
  url: '/business/item-class',

  // 业务对象
  bizObj: [
    {
      label: '上级分类',
      key: 'pid',
      component: 'e-cascader',
      last: false,
      bindkey: 'item_name'
    },
    {
      label: '分类名称',
      key: 'item_name',
      component: 'e-input',
      necessary: true,
      maxlength: 50
    },
    {
      label: '备注',
      key: 'remark',
      component: 'e-text-area',
      maxlength: 200
    }
  ],

  // 初始化前
  beforeOnLoad() {
    if (this.list.data && this.list.data.pid) {
      this.list.data.pid = { id: this.list.data.pid, item_name: this.list.data.pname }
    }
    return Promise.resolve()
  },

  // 初始化后请求耗材分类树
  afterOnLoad(query) {
    http.get({ url: '/business/item-class' }).then(res => {
      if (res.status === 0) {
        this.setData({
          'bizObj[0].tree': res.data[0].children
        })
      } else {
        util.ddToast({ type: 'fail', text: res.message || '获取上级分类失败' })
      }
    })
  },

  // 提交前处理
  beforeSubmit(data) {
    data.pid = data.pid.id
    return Promise.resolve()
  }
})