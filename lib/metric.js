var sys = require('util'),
  path = require('path'),
  fs = require('fs');

var Metric = function() {
  this.name = null;
  this.initialData = {};
  this.interval = 500;
  this.job = null;
  this.minuteJob = null;
  this.clients = [];
  this.incrementCallback = null;
  this.aggregateCallback = null;
  this.fromDb = null;
  this.ignoreOnEmpty = true;
  this.resetMinuteData();
  this.resetData();
}

Metric.prototype = {
  init: function(db,options) {
    var metric = self = this;

    var defaults = {
      //if set to true, every time a metric is written to Mongo, the data will be logged to console
      'log_metric_data': true,
      
      //metric collection options
      'enable_minute_metrics': true,
      'minute_collection': 'metrics_minute',
      'minute_collection_options': {},
      'hour_collection': 'metrics_hour',
      'hour_collection_options': {},
      'day_collection': 'metrics_day',
      'day_collection_options': {}
    };
    this.options = defaults;
    for(var o in defaults) {
      if(typeof options[o] != "undefined") this.options[o] = options[o];
    }

    //minute collection
    db.createCollection(self.options.minute_collection, self.options.minute_collection_options, function(err, collection) {
      db.collection(self.options.minute_collection, function(err, collection) {
        metric.minute_collection = collection;
        //hour collection
        db.createCollection(self.options.hour_collection, self.options.hour_collection_options, function(err, collection) {
          db.collection(self.options.hour_collection, function(err, collection) {
            metric.hour_collection = collection;
            //day collection
            db.createCollection(self.options.day_collection, self.options.day_collection_options, function(err, collection) {
              db.collection(self.options.day_collection, function(err, collection) {
                metric.day_collection = collection;
                metric.resetData();
                metric.resetMinuteData();
                metric.run();
              });
            });
          });
        });
      });
    });
  },

  run: function() {
    this.job = setInterval(this.runner, this.interval, this);
    this.minuteJob = setInterval(this.minuteRunner, 60000, this);
  },

  runner: function(metric) {
    // NOTE: using 'metric' in place of 'this', since run from setInterval
    if(metric.ignoreOnEmpty && !metric.isDirty) { return; }
    metric.io.sockets.volatile.emit(metric.name, metric.data);
    metric.resetData();
  },

  //this is used to get past data for a metric
  //it queries the database and sums up the rows
  getPastData: function(num, time_unit, callback) {
    //start calculating totals based on the initial value for the metric
    //encoding and decoding json is used to clone the initial data
    var totals = JSON.parse(JSON.stringify(this.initialData));

    //each metric can define a callback that goes from a database row
    //to something we can return to the browser
    //if no callback is defined, we return the initialData property
    if(!this.fromDb) return totals;

    //to limit the impact on the database, limit the max past data
    if(num > 60) num = 60;

    var self = this;

    var limit = new Date();
    var query = {}, collection;
    switch(time_unit) {
      case "minute":
      case "minutes":
        //if trying to lookup by minutes and we aren't storing minute data
        if(!self.options.enable_minute_metrics) return;
        collection = self.minute_collection;
        limit.setMinutes(limit.getMinutes() - num);
        query.minute = {$gt: limit};
        break;
      case "hour":
      case "hours":
        collection = self.hour_collection;
        limit.setHours(limit.getHours() - num);
        query.hour = {$gt: limit};
        break;
      //default to days
      default:
        collection = self.day_collection;
        limit.setDate(limit.getDate() - num);
        query.day = {$gt: limit};
        break;
    }

    var cursor = collection.find(query);

    cursor.toArray(function(err,docs) {
      if(err) sys.log(err);
      if(!docs) return;

      for(var i = 0; i< docs.length; i++) {
        totals = self.fromDb(docs[i],totals);
      }
      callback(totals);
    });
  },

  minuteRunner: function(metric) {
    var time = new Date();
    var timestamp = new Date(time.getTime());

    time.setMilliseconds(0);

    time.setSeconds(0);
    var timestampMinute = new Date(time.getTime());
    time.setMinutes(0);
    var timestampHour = new Date(time.getTime());
    time.setHours(0);
    var timestampDay = new Date(time.getTime());

    var mongoData = {
      data: metric.minuteData,
      name: metric.name,
      interval: 60,
      timestamp: timestamp,
      minute: timestampMinute,
      hour: timestampHour,
      day: timestampDay
    };

    if(metric.options.log_metric_data) {
      sys.log(JSON.stringify(mongoData));
    }

    //only store minute data if it's allowed in the options
    if(metric.options.enable_minute_metrics) {
      metric.minute_collection.update({ minute: timestampMinute },
                               { "$inc" : metric.minuteData },
                               { upsert: true },
                               function(err, result) {});
    }

    metric.hour_collection.update({ hour: timestampHour },
                             { "$inc" : metric.minuteData },
                             { upsert: true },
                             function(err, result) {});

    metric.day_collection.update({ day: timestampDay },
                             { "$inc" : metric.minuteData },
                             { upsert: true },
                             function(err, result) {});

    metric.resetMinuteData();
  },

  removeClient: function(client) {
    this.clients.remove(client);
  },

  addClient: function(client) {
    this.clients.push(client);
  },

  resetData: function() {
    this.data = JSON.parse(JSON.stringify(this.initialData));
    this.isDirty = false;
  },

  resetMinuteData: function() {
    this.minuteData = JSON.parse(JSON.stringify(this.initialData));
  },

  stop: function() {
    clearInterval(this.job);
  }
};

Metric.availableMetricPaths = function(callback) {
  var files = fs.readdirSync(path.join(__dirname, 'metrics'));

  for(var i = 0; i < files.length; i++) {
    var file = files[i];
    var filename = file.replace(/\.js$/, '');
    callback(path.join(__dirname, 'metrics', filename));
  }
};

Metric.allMetrics = function(callback) {
  Metric.availableMetricPaths(function(metricPath) {
    var m = require(metricPath);
    if(typeof(m.canLoad) == "function" && m.canLoad() == false) {
      sys.log("Skipping metric " + m.name + ".");
      return;
    } else {
      sys.log("Loading metric " + m.name + ".");
    }

    // Instantiate a new metric and use the settings from the custom metrics class
    var metric = new Metric()
    for(var key in m) {
      metric[key] = m[key];
    }
    callback(metric);
  });
};

exports.Metric = Metric;
