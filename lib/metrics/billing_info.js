var BillingInfoMetric = {
  name: 'billing_info',
  initialData: {},
  interval: 200, // ms
  incrementCallback: function(view) {
    if(view.hasEvent('billing_info') && view.hasProducts()) {
      for(var i in view.products) {
		this.data[i] = this.data[i] || {};
		this.data[i]['billing_info'] = (this.data[i]['billing_info'] || 0) + 1;
		this.minuteData[i+'.billing_info'] = (this.minuteData[i+'.billing_info'] || 0) + 1;
      }
    }
  }
};

for (var i in BillingInfoMetric)
  exports[i] = BillingInfoMetric[i];
