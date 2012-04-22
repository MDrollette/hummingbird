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
  },
  fromDb: function(doc, totals) {
    for(var i in doc) {
      if(doc[i].shipping_info) {
        totals[i] = totals[i] || {};
        totals[i].shipping_info = (totals[i].shipping_info || 0) + doc[i].shipping_info;
      }
    }
    return totals;
  }
};

for (var i in ShippingInfoMetric)
  exports[i] = ShippingInfoMetric[i];
