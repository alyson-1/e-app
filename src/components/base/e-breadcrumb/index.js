Component({
  props: {
    className: '',
    style: '',
    values: [],
    scrollLeft: 9999
  },

  methods: {
    handleItemTap(event) {
      let index = event.target.dataset.index
      let value = event.target.dataset.value
      if (this.props.onItemTap && this.props.values.length - 1 !== index) {
        this.props.onItemTap({
          index: index,
          value: value
        })
      }
    }
  }
})