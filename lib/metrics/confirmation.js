var ConfirmationMetric = {
  name: 'confirmation',
  initialData: {},
  interval: 200, // ms
  incrementCallback: function(view) {
    if(view.hasEvent('confirmation') && view.hasProducts()) {
      for(var i in view.products) {
		this.data[i] = this.data[i] || {};
		this.data[i]['confirmation'] = (this.data[i]['confirmation'] || 0) + 1;
		this.minuteData[i+'.confirmation'] = (this.minuteData[i+'.confirmation'] || 0) + 1;
		  
      }
    }
  }
};

for (var i in ConfirmationMetric)
  exports[i] = ConfirmationMetric[i];
