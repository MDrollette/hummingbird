HummingbirdBase = {
  //override if needed
  //make sure to call this.registerHandler() at the end
  initialize: function(options) {
    var defaults = {
      metrics: [],
      every: 100
    };
    
    this.options = $.extend({},defaults,options);
    
    this.counts = {};
    
    this.registerHandler();
  },
  
  //override as needed to handle non-numeric data
  onData: function(metric, data) {
    this.counts[metric] = (this.counts[metric] || 0) + data;
  },
  
  //override to do your periodic action
  update: function() {
    console.log(this.counts);
  },

  //sets up listener on socket for the metrics specified in this.options.metrics
  //you shouldn't need to override this
  registerHandler: function () {
    var self = this;

    $.each(self.options.metrics,function(i,metric) {
      self.socket.on(metric, function (data) {
        //call function to increment counts
        self.onData(metric, data);
        
        //don't update if we are already running it
        if(self.updating) {
          self.needs_update = true;
          return;
        }
        
        self.updating = true;
        self.needs_update = false;
        self.update();
        
        //throttle calls to update()
        if(self.options.every && self.options.every !== true) {
          setTimeout(function () {
            self.updating = false;
            if (self.needs_update) self.update();
          }, self.options.every);
        }
      });
    });
  }
};
