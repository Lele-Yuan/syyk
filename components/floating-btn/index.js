Component({
  properties: {
    icon: { type: String, value: '💬' },
    bottom: { type: Number, value: 200 }
  },
  methods: {
    onTap() { this.triggerEvent('tap'); }
  }
});
