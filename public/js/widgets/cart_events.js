if (!Hummingbird) {
  var Hummingbird = {};
}

Hummingbird.CartEvents = function (element, socket, options) {
  var defaults = {
    starting_counts: {},
    starting_revenue: {},
    metrics: ['shipping_info','billing_info','confirmation','purchase']
  }

  this.element = element;
  this.options = $.extend({},defaults, options);
  this.socket = socket;
  this.initialize();
};

Hummingbird.CartEvents.prototype = {
  updating: false,
  counts: {},
  chartdivs: {},
  revenue: {},

  initialize: function () {
    if (typeof this.options.starting_counts != 'object') this.counts = {};
    else this.counts = this.options.starting_counts;

    if (this.options.starting_revenue) this.revenue = this.options.starting_revenue;

    this.update();

    this.registerHandler();
  },

  registerHandler: function () {
    var self = this;

    $.each(self.options.metrics,function(i,metric) {
      self.socket.on(metric, function (data) {
        self.onData(metric, data);
      });
    });
  },

  onData: function (type, message) {
    var self = this;
    var changed = false;
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

      changed = true;
    }

    if (changed) {
      self.update();
    }
  },

  update: function () {
    var self = this;
    if (self.updating) {
      self.needs_updating = true;
      return;
    }
    self.updating = true;
    self.needs_updating = false;

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

    setTimeout(function () {
      self.updating = false;
      if (self.needs_updating) self.update();
    }, 200);
  },

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
};
