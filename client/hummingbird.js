HummingbirdTracker = {};

HummingbirdTracker.setTrackingServer = function(server) {
	this.server = server;
}

HummingbirdTracker.prepareVars = function(env) {
	var params = [];
	for(var i in env) {
		params.push(i+'='+escape(env[i]));
	}
	return params.join('&');
}

HummingbirdTracker.track = function(env, cachebust) {
  if(!this.server) return false;
	
  delete env.trackingServer;
  delete env.trackingServerSecure;
  env.u = document.location.href;
  env.bw = window.innerWidth;
  env.bh = window.innerHeight;

  if(document.referrer && document.referrer != "") {
    env.ref = document.referrer;
  }

  //cache buster
  if(cachebust) env.f = Math.ceil(Math.random() * 1000000);
  
  var img = document.createElement('img');
  img.width = '1';
  img.height = '1';
  img.src = this.server + 'tracking.gif?' + this.prepareVars(env);
  
  document.body.appendChild(img);
  
  return false;
};
