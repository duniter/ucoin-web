var async = require('async');

module.exports = function (node, auth) {
  
  this.index = function(req, res){
    node.ucg.peering(proxy(res, function (json) {
      console.log(json);
      res.render('index', {
        currency: json.currency,
        remotehost: json.remote.host,
        remoteport: json.remote.port,
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
