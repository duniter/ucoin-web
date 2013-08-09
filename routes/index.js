var async = require('async');

module.exports = function (node, auth) {
  
  this.index = function(req, res){
    node.ucg.peering(proxy(res, function (json) {
      res.render('index', {
        currency: json.currency,
        ipv4: json.ipv4,
        ipv6: json.ipv6,
        port: json.port,
        dns: json.dns,
        peers: json.peers,
        fingerprint: json.key,
        membersCount: 0,
        amendmentsCount: 0,
        transactionsCount: 0,
        auth: auth
      });
    }));
  };

  return this;
}

function proxy(res, callback) {
  return function (err, json) {
    if(err){
      res.send(500, err);
      return;
    }
    else callback(json);
  }
}
