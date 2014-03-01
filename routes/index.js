var async = require('async');
var _     = require('underscore');
var hdc   = require('hdc');

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
        node.ucg.peering.get(next);
      },
      function (json, next){
        data["currency"] = json.currency;
        data["endpoints"] = json.endpoints;
        data["peers"] = [];//json.peers;
        data["fingerprint"] = json.fingerprint;
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
        var am = new hdc.Amendment();
        am.membersChanges = json.membersChanges || [];
        data["amendmentsCount"] = json.number + 1;
        data["membersCount"] = json.membersCount || 0;
        data["membersJoining"] = am.getNewMembers().length;
        data["membersLeaving"] = am.getLeavingMembers().length;
        data["votersCount"] = json.votersCount || 0;
        data["votersJoining"] = am.getNewVoters().length;
        data["votersLeaving"] = am.getLeavingVoters().length;
        node.ucs.amendment.proposed(json.number + 1, function (err, json) {
          data["amendmentsPending"] = err ? 0 : 1;
          next();
        });
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
        node.ucs.parameters(function (err, parameters) {
          if (!err) {
            var start = new Date();
            start.setTime(parseInt(parameters.AMStart)*1000);
            data["AMStart"] = start.toString();
            data["AMFreq"] = (parseInt(parameters.AMFrequency)/3600) + " hours";
            data["UD0"] = parameters.UD0;
            data["UDFreq"] = (parseInt(parameters.UDFrequency)/3600) + " hours";
            data["UDPercent"] = (parameters.UDPercent*100) + "%";
          }
          next();
        });
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
    node.ucg.peering.get(proxy(res, function (json) {
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
              {cap: "Actualize - update his living status", level: DONE},
              {cap: "Leave - ask for leaving the Community", level: DONE},
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
              {cap: "Receive issuance transactions", level: DONE},
              {cap: "Receive fusion transactions", level: DONE},
              {cap: "Receive transfert transactions", level: DONE},
              {cap: "View all the transactions", level: DONE},
              {cap: "View a single transaction", level: STARTED},
              {cap: "View transactions for a sender", level: DONE},
              {cap: "View transactions for a recipient", level: STARTED},
              {cap: "View coins owned by a PGP key", level: DONE},
              {cap: "View a coin's transaction chain", level: DONE},
              {cap: "View all keys managed by this node (for receiving and sending)", level: STARTED}
            ]
          },
          {
          title: 'Peering',
            values: [
              {cap: "Authenticate responses before interpreting them", level: STARTED},
              {cap: "Retrieve PGP keys from another node", level: DONE},
              {cap: "Retrieve promoted Amendments from another node", level: DONE},
              {cap: "Retrieve registrations of an Amendment from another node", level: DONE},
              {cap: "Retrieve signatures (votes) of an Amendment from another node", level: DONE},
              {cap: "Retrieve transactions from another node", level: DONE},
              {cap: "Retrieve transactions of a sender from another node", level: DONE},
              {cap: "Retrieve transactions of a recipient from another node", level: NOTHING},
              {cap: "Add a key to managed keys", level: NOTHING},
              {cap: "Add a bunch of keys to managed keys", level: NOTHING},
              {cap: "Remove a key from managed keys", level: NOTHING},
              {cap: "Remove a bunch of keys from managed keys", level: NOTHING},
              {cap: "View managed keys", level: NOTHING},
              {cap: "Synchronise from another node in launched mode", level: NOTHING},
              {cap: "Synchronise public keys", level: NOTHING},
              {cap: "Synchronise amendments excepted currently promoted", level: NOTHING},
              {cap: "Synchronise currently promoted amendment", level: NOTHING},
              {cap: "Synchronise current votes", level: NOTHING},
              {cap: "Synchronise current memberships", level: NOTHING},
              {cap: "Synchronise pending votes for next amendment", level: NOTHING},
              {cap: "Synchronise managed keys transactions", level: NOTHING},
              {cap: "Synchronise peers", level: NOTHING},
              {cap: "Subscribe to another node for a given key", level: NOTHING},
              {cap: "Unsubscribe to another node for a given key", level: NOTHING},
              {cap: "Maintain peers list according to peers status updates", level: NOTHING},
              {cap: "Maintain peers list according to peers status updates", level: NOTHING},
              {cap: "Regular check of others nodes' changes", level: NOTHING},
              {cap: "Synchronise from another node using sync command", level: NOTHING},
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

Date.prototype.toString = function () {
  return [
    this.getFullYear(),
    zeroLeft(this.getMonth() + 1),
    zeroLeft(this.getDate()),
  ].join("-")
    + " " + [
    zeroLeft(this.getHours()),
    zeroLeft(this.getMinutes()),
    zeroLeft(this.getSeconds())
  ].join(":");
}

function zeroLeft(number){
  return number < 10 ? "0" + (number) : number;
}