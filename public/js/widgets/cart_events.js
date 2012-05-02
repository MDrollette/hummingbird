if (!Hummingbird) {
  var Hummingbird = {};
}

//constructor
Hummingbird.CartEvents = function (element, socket, options) {
  this.element = element;
  this.socket = socket;
  
  this.initialize(options);
};

//inherit HummingbirdBase
Hummingbird.CartEvents.prototype = HummingbirdBase;

//override methods and add custom properties
$.extend(Hummingbird.CartEvents.prototype,{  
  initialize: function(options) {
    var defaults = {
      metrics: ['shipping_info','billing_info','confirmation','purchase'],
      every: 100
    };
    
    this.options = $.extend({},defaults, options);  
    
    //initialize variables
    this.chartdivs = {};
    this.counts = {};
    this.revenue = {};
    
    //register socket listener
    this.registerHandler();
  },

  //handle incoming requests
  onData: function (type, message) {
    var self = this;
    for (var i in message) {
      //initial data for product
      if(!self.counts[i]) {
        self.counts[i] = {};
        $.each(self.options.metrics,function(j,metric) {
          self.counts[i][metric] = 0;
        });
      }
      if(!self.revenue[i]) self.revenue[i] = 0.0;

      self.counts[i][type] = self.counts[i][type] || 0;
      self.counts[i][type] += message[i][type];

      //if revenue is passed in with this event, record it
      if(message[i].revenue) {
        self.revenue[i] = (self.revenue[i] || 0) + message[i].revenue*1;
      }
    }
  },

  //initialize/update the graphs and chart data
  update: function () {
    var self = this;

    for (var i in this.counts) {
      //update the existing chart
      if (self.chartdivs[i]) {
        self.updateDiv(i, this.counts[i], this.revenue[i]);
      } 
      //build initial chart html
      else {
        var html = '<h2>' + i + '</h2><div class="bar_holder">';
        $.each(self.options.metrics,function(j,metric) {
          html += '<div class="'+metric+'"><div class="spacer"></div><div class="bar"></div></div>';
        });
        html += '</div><div class="revenue"></div>';

        self.chartdivs[i] = $('<div />').addClass('graph').html(html).appendTo(self.element);
        self.updateDiv(i, this.counts[i], this.revenue[i]);
      }

      this.counts[i].shipping_info || 0
    }
  },

  //calculate and set bar heights and text for a graph
  updateDiv: function (product, data, revenue) {
    var self = this;

    var max = 0;
    $.each(self.options.metrics,function(i,metric) {
      if(data[metric] > max) max = data[metric];
    });

    for (var i in data) {
      var height = Math.floor(data[i] * 100 / max);
      $('.' + i + ' .spacer', self.chartdivs[product]).css('height', (100 - height + 15) + 'px').html(data[i]);
      $('.' + i + ' .bar', self.chartdivs[product]).css('height', height + 'px');

      $('.revenue', self.chartdivs[product]).html('$' + (revenue || 0).toFixed(2));
    }
  }
});
