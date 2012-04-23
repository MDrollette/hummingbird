var fs = require('fs');
module.exports = config = {
  "name" : "Hummingbird",

  "tracking_port" : 8000,
  "dashboard_port" : 8080,

  "mongo_host" : "localhost",
  "mongo_port" : 27017,

  "udp_address" : "127.0.0.1",
  "udp_port" : 8000,

  "enable_dashboard" : true,
  
  //if set to an integer, the visits collection in Mongo
  //(i.e. the one that has a document for every tracking pixel fired)
  //will be a capped collection with this many bytes max.
  //the oldest entries will be deleted first to make space.
  //If set to false or a non-integer, the collection will not be capped.
  "visits_capped" : 100000000,

  //if set to true, both the tracking pixel and dashboard will be served under https
  "https": false,

  //required parameters if using https
  //"https_key": fs.readFileSync("/path/to/key.pem"),
  //"https_cert": fs.readFileSync("/path/to/cert.pem"),
  
  'metric_options': {
    //don't store minute data in Mongo, only hour and daily data
    'minutes': false,
    //don't output to console every minute
    'log': false
  }
}
