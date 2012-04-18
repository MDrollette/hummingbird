var PageViewsMetric = {
  name: 'page_views',
  initialData: 0,
  interval: 50, // ms
  incrementCallback: function(view) {
    if(view.hasEvent('event1')) {
    	this.data += 1;
    	this.minuteData = (this.minuteData || {});
    	this.minuteData['page_views'] = (this.minuteData['page_views'] || 0) + 1;
    }
  }
};

for (var i in PageViewsMetric)
  exports[i] = PageViewsMetric[i];
