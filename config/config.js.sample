//fs is needed to read in key and cert files when using https
//var fs = require('fs');


module.exports = config = {
  //server config for the tracking pixel
  //if an ip is provided, the server will only listen on that ip
  "tracking_port" : 8000,
  "tracking_hostname" : false,

  //server config for the dashboard server
  //this just serves up static files out of the /public directory
  //this can be hosted anywhere are doesn't need to be done through node.js
  "enable_dashboard" : true,
  "dashboard_port" : 8080,
  "dashboard_hostname" : false,

  //anyone with access to the websocket can view all analytics data,
  //so make sure this is protected if you care about privacy
  //if port is set to false, socket.io will listen to the dashboard server or
  //the tracking server if the dashboard is disabled
  "websocket_port" : false,
  "websocket_hostname" : false,
  "websocket_log_level" : 2,

  //MongoDB config
  "mongo_port" : 27017,
  "mongo_hostname" : "localhost",

  //udp config
  //incomming data to the udp server will behave just like an incomming tracking pixel
  "enable_udp": true,
  "udp_port" : 8000,
  "udp_hostname" : "127.0.0.1",
  
  //the visits collection creates a document for every incomming tracking pixel
  //this options is the maximum size in bytes that the collection can be
  //the oldest documents will be discarded first if space is needed
  //set this to false to not use a capped collection
  "capped_visits_collection" : 100000000,

  //https settings
  //if turned on, both the tracking pixel and dashboard will be served under https
  "enable_https": false,
  //"https_key": fs.readFileSync("/path/to/key.pem"),
  //"https_cert": fs.readFileSync("/path/to/cert.pem"),
  
  //additional options for metric data
  'metric_options': {
    //don't store minute data in Mongo, only hour and daily data
    'minutes': false,
    //don't output to console every minute
    'log': false
  }
}
