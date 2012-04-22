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
  
  //required if using https
  //"https_key": fs.readFileSync("/path/to/key.pem"),
  //"https_cert": fs.readFileSync("/path/to/cert.pem"),
  
  "https": false
}
