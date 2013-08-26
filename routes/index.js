var async = require('async');
var _     = require('underscore');

module.exports = function (node, auth) {
  
  this.index = function(req, res){
    var data = {
      membersActualizing: 0,
      membersJoining: 0,
      membersLeaving: 0,
      transactionsCount: 0,
      auth: auth
    };
    async.waterfall([
      function (next){
        node.ucg.peering(next);
      },
      function (json, next){
        data["currency"] = json.currency;
        data["remotehost"] = json.remote.host;
        data["remoteport"] = json.remote.port;
        data["peers"] = json.peers;
        data["fingerprint"] = json.key;
        next();
      },
      function (next){
        node.hdc.amendments.current(function (err, json) {
          if(err){
            next(null, { number: -1, membersCount:0 });
            return;
          }
          next(null, json);
        });
      },
      function (json, next){
        data["amendmentsCount"] = json.number + 1;
        data["membersCount"] = json.membersCount;
        data["amendmentsPending"] = 0;
        next();
      },
      function (next){
        node.hdc.amendments.votes.get(next);
      },
      function (json, next){
        _(json.amendments).each(function (value, number) {
          if(number > data["amendmentsCount"] - 1){
            data["amendmentsPending"] += _(value).size();
          }
        });
        next();
      },
      function (next){
        node.hdc.community.memberships({extract:true}, next);
      },
      function (json, next){
        _(json.merkle.leaves).each(function (obj) {
          data["membersJoining"] += obj.value.request.status == 'JOIN' ? 1 : 0;
          data["membersActualizing"] += obj.value.request.status == 'ACTUALIZE' ? 1 : 0;
          data["membersLeaving"] += obj.value.request.status == 'LEAVE' ? 1 : 0;
        })
        next();
      },
    ], function (err, result) {
      if(err){
        res.send(500, err);
        return;
      }
      res.render('home/index', data);
    });
  };
  
  this.capabilities = function(req, res){
    node.ucg.peering(proxy(res, function (json) {
      var DONE = 2;
      var STARTED = 1;
      var NOTHING = 0;
      res.render('home/capabilities', {
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
              {cap: "Actualize - update his living status", level: STARTED},
              {cap: "Leave - ask for leaving the Community", level: STARTED},
              {cap: "Implement a strategy for status's changes acception", level: NOTHING},
              {cap: "View Community changes (status, people) of a promoted Amendment", level: DONE},
              {cap: "View Community changes (status, people) for next Amendment", level: DONE}
            ]
          },
          {
            title: 'Amendments',
            values: [
              {cap: "Receive votes for an Amendment", level: DONE},
              {cap: "Record a voted Amendment", level: DONE},
              {cap: "Have an overview of received votes/amendments", level: DONE},
              {cap: "View current votes of a pending Amendment", level: DONE},
              {cap: "Implement strategy for promoting Amendments", level: STARTED},
              {cap: "Promote a pending Amendment", level: DONE},
              {cap: "View currently promoted Amendment", level: DONE},
              {cap: "View previously promoted Amendments", level: DONE},
              {cap: "View registrations of a promoted Amendment", level: DONE},
              {cap: "View signatures (votes) of a promoted Amendment", level: DONE}
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

