var CartAddsMetric = {
  name: 'cart_adds',
  initialData: 0,
  interval: 50, // ms
  incrementCallback: function(view) {
    if(view.hasEvent('scAdd') || view.hasEvent('cart_add')) {
      this.data += 1;
      this.minuteData += 1;
    }
  }
}

for (var i in CartAddsMetric)
  exports[i] = CartAddsMetric[i];
