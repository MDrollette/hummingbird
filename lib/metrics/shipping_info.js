var ShippingInfoMetric = {
  name: 'shipping_info',
  initialData: {},
  interval: 200, // ms
  incrementCallback: function(view) {
    if(view.hasEvent('shipping_info') && view.hasProducts()) {
      for(var i in view.products) {
		this.data[i] = this.data[i] || {};
		this.data[i]['shipping_info'] = (this.data[i]['shipping_info'] || 0) + 1;
		this.minuteData[i+'.shipping_info'] = (this.minuteData[i+'.shipping_info'] || 0) + 1;
		  
      }
    }
  }
};

for (var i in ShippingInfoMetric)
  exports[i] = ShippingInfoMetric[i];
