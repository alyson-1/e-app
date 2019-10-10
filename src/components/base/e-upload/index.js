import util from '/src/libs/util.js'

let app = getApp()

Component({
  data: {
    pos: { // 长按时手指位置
      pageX: 0,
      pageY: 0
    },
    openModal: false, // 上传设置
    openTypeChooser: false // 弹出按钮
  },

  props: {
    params: {}
  },

  // 挂载方法
  didMount() {
    this._complete(this.props.params)
  },

  // setData后执行
  didUpdate(prevProps, prevData) {
    if (prevProps.params.files.length < this.props.params.files.length) {
      this.uploadFiles()
    }
  },

  methods: {
    // 选择文件
    selectFile() {
      switch (this.props.params.type) {
        case 'image':
          this.selectImage()
          break
        case 'video':
          this.selectVideo()
          break
        case 'audio':
          this.selectAudio()
          break
        default:
          break
      }
    },

    // 拍照或者选择图片
    selectImage() {
      this.closeChooseType()
      dd.chooseImage({
        count: this.props.params.maxlength - this.props.params.files.length,
        success: (res) => {
          console.log(JSON.stringify(res))
          let arr = []
          for (let i = 0; i < res.apFilePaths.length; i++) {
            let name = `image${util.formatDate('yyyyMMddHHmmss', new Date())}${i}`
            arr.push({ name: name, path: res.apFilePaths[i], status: 0, type: 'image' })
          }
          let files = `${this.props.params.id}.files`
          this.$page.$spliceData({
            [files]: [this.props.params.files.length, 0, ...arr]
          })
        },
        fail: (err) => {
          console.error(err)
        }
      })
    },

    // 录音或选择音频
    selectAudio() {
      this.closeChooseType()
    },

    // 选择或拍摄视频
    selectVideo() {
      this.closeChooseType()
      dd.chooseVideo({
        maxDuration: 60,
        success: (res) => {
          console.log(JSON.stringify(res))
          let arr = []
          let name = `video${util.formatDate('yyyyMMddHHmmss', new Date())}0`
          arr.push({ name: name, path: res.apFilePath, status: 0, type: 'video' })
          let files = `${this.props.params.id}.files`
          this.$page.$spliceData({
            [files]: [this.props.params.files.length, 0, ...arr]
          })
        },
        fail: (err) => {
          console.error(err)
        }
      })
    },

    // 上传文件
    uploadFiles() {
      for (let i = 0; i < this.props.params.files.length; i++) {
        let file = this.props.params.files[i]
        if (file.status === 100) {
          continue
        } else {
          dd.uploadFile({
            url: 'http://boyo.ngrok.yungcloud.cn/zuul/system/v1/upload/files',
            fileType: file.type,
            fileName: file.name,
            filePath: file.path,
            header: {
              'Authorization': app.globalData.token
            },
            success: (res) => {
              console.log(JSON.stringify(res))
            },
            fail: (err) => {
              let text = JSON.stringify(err)
              switch (err.error) {
                case 11:
                  text = '文件不存在'
                  break
                case 12:
                  text = '文件上传失败'
                  break
                case 13:
                  text = '没有文件权限'
                  break
                default:
                  break
              }
              util.ddToast({ type: 'fail', text: text })
            }
          })
        }
      }
    },

    // 打开文件
    openFile(event) {
      let i = event.currentTarget.dataset.fileIndex
      switch (this.props.params.type) {
        case 'image':
          this.openImage(i)
          break
        case 'video':
          this.openVideo(i)
          break
        case 'audio':
          this.openAudio(i)
          break
        default:
          break
      }
    },

    // 显示图片
    openImage(index) {
      let urls = []
      for (let i = 0; i < this.props.params.files.length; i++) {
        urls.push(this.props.params.files[i].url)
      }
      dd.previewImage({
        current: index,
        urls: urls
      })
    },

    // 删除文件
    deleteFile(event) {
      let i = event.currentTarget.dataset.fileIndex
      let files = `${this.props.params.id}.files`
      this.$page.$spliceData({
        [files]: [i, 1]
      })
    },

    // 打开设置框
    showSetting() {
      this.setData({
        'openModal': true
      })
    },

    // 关闭设置框
    onModalClose() {
      this.setData({
        'openModal': false
      })
    },

    // 触摸开始时设置pos
    touchStart(event) {
      this.setData({
        'pos': {
          pageX: event.touches[0].pageX,
          pageY: event.touches[0].pageY
        }
      })
    },

    // 选择上传文件类型
    chooseType(event) {
      if (this.props.params.files.length >= this.props.params.maxlength) {
        util.ddToast(`最多上传${this.props.params.maxlength}个文件`)
        return
      }
      switch (this.props.params.type) {
        case 'image':
          this.selectImage()
          break
        case 'audio':
          this.selectAudio()
          break
        case 'vidio':
          this.selectVideo()
          break
        default:
          this.setData({
            'openTypeChooser': true
          })
          break
      }
    },

    // 关闭选择上传文件类型
    closeChooseType() {
      this.setData({
        'openTypeChooser': false
      })
    },

    // 补充params的属性
    _complete(item) {
      if (!item.id) {
        console.error('此组件内props接收的参数没有设置id')
        return
      }
      let obj = {
        label: item.type === 'image' ? '图片' : item.type === 'audio' ? '音频' : item.type === 'video' ? '视频' : '文件',
        files: [],
        maxlength: 10,
        type: 'file'
      }
      let temp = item
      for (let key in obj) {
        if (!temp[key]) {
          temp[key] = obj[key]
        }
      }
      let id = `${temp.id}`
      this.$page.setData({
        [id]: temp
      })
    }

  }

})