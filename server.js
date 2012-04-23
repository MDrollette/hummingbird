var http = require('http'),
  https = require('https'),
  config = require('./config/config'),
  dgram = require('dgram'),
  node_static = require('node-static'),
  sio = require('socket.io'),
  mongo = require('mongodb'),
  Hummingbird = require('./lib/hummingbird').Hummingbird;

var db = new mongo.Db('hummingbird', new mongo.Server(config.mongo_hostname, config.mongo_port, {}), {});

db.addListener("error", function (error) {
  console.log("Error connecting to mongo -- perhaps it isn't running?");
});

db.open(function (p_db) {
  var hummingbird = new Hummingbird();
  hummingbird.init(db, config, function () {
    var server;
    if (config.enable_https) {
      server = https.createServer({'key': config.https_key, 'cert': config.https_cert});
    }
    else {
      server = http.createServer();
    }
    server.on('request',function (req, res) {
      try {
        hummingbird.serveRequest(req, res);
      } catch (e) {
        hummingbird.handleError(req, res, e);
      }
    });
    
    if (config.tracking_hostname) {
      server.listen(config.tracking_port,config.tracking_hostname);
    }
    else {
      server.listen(config.tracking_port);
    }
    console.log('Tracking server running at http'+(config.enable_https? 's' : '')+'://'+(config.tracking_hostname || '*')+':'+config.tracking_port+'/tracking_pixel.gif');

    if (config.enable_dashboard) {
      var file = new(node_static.Server)('./public');

      var dashboardServer;
      if (config.enable_https) {
        dashboardServer = https.createServer({'key': config.https_key, 'cert': config.https_cert});
      }
      else {
        dashboardServer = http.createServer();
      }
      dashboardServer.on('request',function (request, response) {
        request.addListener('end', function () {
          file.serve(request, response);
        });
      });

      if(config.dashboard_hostname) {
        dashboardServer.listen(config.dashboard_port, config.dashboard_hostname);
      }
      else {
        dashboardServer.listen(config.dashboard_port);
      }

      console.log('Dashboard server running at http'+(config.enable_https? 's' : '')+'://'+(config.dashboard_hostname || '*')+':'+config.dashboard_port);
    } 
    
    var io;
    //if a specific port is defined, listen on it
    if(config.websocket_port) {
      if(config.websocket_hostname) {
        io = sio.listen(config.websocket_port, config.websocket_hostname);
      }
      else {
        io = sio.listen(config.websocket_port);
      }
      console.log('Web Socket server running at ws://'+(config.websocket_hostname || '*')+':'+config.websocket_port);
    }
    //otherwise, listen to the dashboard server if it's enabled
    else if(dashboardServer) {
      io = sio.listen(dashboardServer);
      console.log('Web Socket server running at ws://'+(config.dashboard_hostname || '*')+':'+config.dashboard_port);
    }
    //as a last resort, listen to the tracking server
    else {
      io = sio.listen(server);
      console.log('Web Socket server running at ws://'+(config.tracking_hostname || '*')+':'+config.tracking_port);
    }
    
    io.set('log level', config.websocket_log_level);

    hummingbird.io = io;
    hummingbird.addAllMetrics(io, db, config.metric_options);

    if (config.enable_udp) {
      var udpServer = dgram.createSocket("udp4");

      udpServer.on("message", function (message, rinfo) {
        console.log("message from " + rinfo.address + " : " + rinfo.port);

        var data = JSON.parse(message);
        hummingbird.insertData(data);
      });

      udpServer.bind(config.udp_port, config.udp_hostname);
      console.log('UDP server running on UDP port ' + config.udp_port + ' and host '+config.udp_hostname);
    }
  });
});
