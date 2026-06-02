Component({
  properties: {
    icon: { type: String, value: '💬' },
    image: { type: String, value: '' },
    bottom: { type: Number, value: 200 }
  },
  methods: {
    onTap() { this.triggerEvent('tap'); }
  }
});
