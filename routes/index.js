var async = require('async');

module.exports = function (node, auth) {
  
  this.index = function(req, res){
    node.ucg.peering(proxy(res, function (json) {
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
  
  this.capabilities = function(req, res){
    node.ucg.peering(proxy(res, function (json) {
      var DONE = 2;
      var STARTED = 1;
      var NOTHING = 0;
      res.render('capabilities', {
        caps: [
          {
            title: 'PKS',
            values: [
              {cap: "Submit a Public Key - self signed", level: STARTED},
              {cap: "Search for one or more keys in submitted keys", level: STARTED}
            ]
          },
          {
            title: 'Community',
            values: [
              {cap: "Register - ask for joining the Community", level: DONE},
              {cap: "Actualize - update his living status", level: NOTHING},
              {cap: "Leave - ask for leaving the Community", level: NOTHING},
              {cap: "Implement a strategy for status's changes acception", level: NOTHING},
              {cap: "View Community changes (status, people) of a promoted Amendment", level: STARTED},
              {cap: "View Community changes (status, people) for next Amendment", level: DONE}
            ]
          },
          {
            title: 'Amendments',
            values: [
              {cap: "Receive votes for an Amendment", level: STARTED},
              {cap: "Record a voted Amendment", level: STARTED},
              {cap: "Have an overview of received votes/amendments", level: STARTED},
              {cap: "View current votes of a pending Amendment", level: STARTED},
              {cap: "Implement strategy for promoting Amendments", level: STARTED},
              {cap: "Promote a pending Amendment", level: STARTED},
              {cap: "View currently promoted Amendment", level: STARTED},
              {cap: "View previously promoted Amendments", level: STARTED},
              {cap: "View registrations of a promoted Amendment", level: STARTED},
              {cap: "View signatures (votes) of a promoted Amendment", level: STARTED}
            ]
          },
          {
          title: 'Transactions',
            values: [
              {cap: "Receive issuance transactions", level: NOTHING},
              {cap: "Receive fusion transactions", level: NOTHING},
              {cap: "Receive transfert transactions", level: NOTHING},
              {cap: "View all the transactions", level: NOTHING},
              {cap: "View a single transaction", level: NOTHING},
              {cap: "View transactions for a sender", level: NOTHING},
              {cap: "View transactions for a recipient", level: NOTHING},
              {cap: "View coins owned by a PGP key", level: NOTHING},
              {cap: "View a coin's transaction chain", level: NOTHING}
            ]
          },
          {
          title: 'Peering',
            values: [
              {cap: "Authenticate responses before interpreting them", level: STARTED},
              {cap: "Retrieve PGP keys from another node", level: NOTHING},
              {cap: "Retrieve promoted Amendments from another node", level: NOTHING},
              {cap: "Retrieve registrations of an Amendment from another node", level: NOTHING},
              {cap: "Retrieve signatures (votes) of an Amendment from another node", level: NOTHING},
              {cap: "Retrieve transactions from another node", level: NOTHING},
              {cap: "Retrieve transactions of a sender from another node", level: NOTHING},
              {cap: "Retrieve transactions of a recipient from another node", level: NOTHING}
            ]
          }
        ],
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
