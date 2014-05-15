var async = require('async');
var _     = require('underscore');
var hdc   = require('hdc');
var contract = require('../tools/contract')

module.exports = function (node, auth) {
  
  this.home = function(req, res){
    var data = {
      membersActualizing: 0,
      membersJoining: 0,
      membersLeaving: 0,
      transactionsCount: 0,
      auth: auth
    };
    async.waterfall([
      function (next){
        node.network.peering.get(next);
      },
      function (json, next){
        data["currency"] = json.currency;
        data["endpoints"] = json.endpoints;
        data["peers"] = [];//json.peers;
        data["fingerprint"] = json.fingerprint;
        next();
      },
      function (next){
        node.hdc.amendments.current(function (err, am) {
          if(err){
            next(null, { number: -1, membersCount:0 });
            return;
          } else {
            if(am){
              contract.getStack(am, node, function (err) {
                next(err, am);
              });
            }
            else next(null, am);
          }
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
        data["MMass"] = contract.monetaryMass();
        data["LastUD"] = contract.lastDividend();
        data["LastMembers"] = contract.lastDividendMembersCount();
        node.registry.amendment.proposed(json.number + 1, function (err, json) {
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
        node.registry.parameters(function (err, parameters) {
          if (!err) {
            var start = new Date();
            start.setTime(parseInt(parameters.AMStart)*1000);
            data["AMStart"] = start.toString();
            data["AMFreq"] = (parseInt(parameters.AMFrequency)/3600) + " hours";
            data["UD0"] = parameters.UD0;
            data["UDFreq"] = (parseInt(parameters.UDFrequency)/3600) + " hours";
            data["UDPercent"] = (parameters.UDPercent*100) + "%";
          }
          next(null, data);
        });
      },
    ], function (err, data) {
      if(err){
        res.send(500, err);
        return;
      }
      res.setHeader('Content-type', 'application/json');
      res.send(200, data);
    });
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