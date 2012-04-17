var View = function(env) {
  if(!this instanceof View) {
    return new View(env);
  }

  this.env = env;

  this.events = {};
  if(env.events) {
    var events = env.events.split(',');
    for(var i = 0; i < events.length; i++) {
      this.events[events[i]] = true;
    }
  }


  this.products = {};
  this.num_products = 0;

  if(env.products) {
    var products = env.products.split(',');
    for(var i = 0; i < products.length; i++) {
      var parts = products[i].split(';');
      if(parts[1]) {
        this.num_products ++;
        this.products[parts[1]] = {
          category: parts[0],
          name: parts[1],
          qty: parts[2] || 1,
          price: (parts[3] || 0.0)*1
        };
      }
    }
  }

  this.env.events = this.events;
  this.env.products = this.products;
};

View.prototype.hasEvent = function(event) {
  if(this.events[event]) return true;
  else return false;
};
View.prototype.hasProducts = function() {
  return this.num_products > 0;
};

exports.View = View;