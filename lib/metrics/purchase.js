var PurchaseMetric = {
  name: 'purchase',
  initialData: {},
  interval: 200, // ms
  incrementCallback: function(view) {
    if(view.hasEvent('purchase') && view.hasProducts()) {
      for(var i in view.products) {
		this.data[i] = this.data[i] || {};
		this.data[i]['purchase'] = (this.data[i]['purchase'] || 0) + 1;
		this.data[i]['revenue'] = (this.data[i]['revenue'] || 0) + view.products[i].price*1;
		
		this.minuteData[i+'.purchase'] = (this.minuteData[i+'.purchase'] || 0) + 1;
		this.minuteData[i+'.revenue'] = (this.minuteData[i+'.revenue'] || 0) + view.products[i].price*1;
      }
    }
  },
  fromDb: function(doc, totals) {
    for(var i in doc) {
      if(doc[i].purchase) {
        totals[i] = totals[i] || {};
        totals[i].purchase = (totals[i].purchase || 0) + doc[i].purchase;
      }
      if(doc[i].revenue) {
        totals[i] = totals[i] || {};
        totals[i].revenue = (totals[i].revenue || 0) + doc[i].revenue*1;
      }
    }
    return totals;
  }
};

for (var i in PurchaseMetric)
  exports[i] = PurchaseMetric[i];
