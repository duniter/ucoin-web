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
        data["fingerprint"] = json.pubkey;
        next();
      },
      function (next){
        async.parallel({
          current: function (next) {
            node.blockchain.current(next);
          },
          parameters: function (next) {
            node.currency.parameters(function (err, json) {
              next(err, json);
            });
          },
          uds: function (next) {
            async.waterfall([
              function (next) {
                node.blockchain.with.ud(next);
              },
              function (json, next) {
                var blockNumbers = json.result.blocks;
                var blocks = [];
                async.forEachSeries(blockNumbers, function (blockNumber, callback) {
                  async.waterfall([
                    function (next) {
                      node.blockchain.block(blockNumber, next);
                    },
                    function (block, next) {
                      blocks.push(block);
                      next();
                    }
                  ], callback);
                }, function (err) {
                  next(err, blocks);
                });
              }
            ], next);
          },
          root: function (next) {
            node.blockchain.block(0, next);
          }
        }, next);
      },
      function (res, next){
        var current = res.current;
        var uds = res.uds;
        var parameters = res.parameters;
        var lastUDblock = uds.length > 0 ? uds[uds.length-1] : null;
        var prevUDblock = uds.length > 1 ? uds[uds.length-2] : null;
        data["currency_acronym"] = 'ZB';
        data["amendmentsCount"] = current.number + 1;
        data["membersCount"] = current.membersCount || 0;
        data["membersJoining"] = 0; // TODO
        data["membersLeaving"] = 0; // TODO
        data["votersCount"] = 0; // TODO
        data["votersJoining"] = 0; // TODO
        data["votersLeaving"] = 0; // TODO
        data["UD_1"] = prevUDblock ? prevUDblock.dividend : 0;
        data["N_1"] = prevUDblock ? prevUDblock.membersCount : 0;
        data["M_1"] = prevUDblock ? prevUDblock.monetaryMass : 0;
        data["UD"] = lastUDblock ? lastUDblock.dividend : parameters.ud0;
        data["N"] = lastUDblock ? lastUDblock.membersCount : 0;
        data["M"] = lastUDblock ? lastUDblock.monetaryMass : 0;
        data["MsurN"] = data.M / data.N;
        data["M_1surN"] = data.M_1 / data.N;
        data["blocks"] = res.uds;
        data["parameters"] = res.parameters;
        // ....
        // var start = new Date();
        // start.setTime(parseInt(parameters.AMStart)*1000);
        data["amendmentsPending"] = 0; // TODO
        data["AMStart"] = 0; // TODO start.toString();
        data["AMFreq"] = (parseInt(parameters.avgGenTime)/60) + " minutes";
        data["UD0"] = parameters.ud0;
        data["UDFreq"] = (parseInt(parameters.dt)/(3600*24)) + " days";
        data["UDPercent"] = (parameters.c*100) + "%";
        next(null, data);
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