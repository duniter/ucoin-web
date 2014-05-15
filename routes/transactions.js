var async    = require('async');
var sha1     = require('sha1');
var fs       = require('fs');
var _        = require('underscore');
var hdc      = require('hdc');
var contract = require('../tools/contract');

module.exports = function (node, auth) {
  
  this.lasts = function(req, res){
    async.waterfall([
      function (next){
        node.hdc.amendments.current(function (err, am) {
          if(am){
            contract.getStack(am, node, next);
          }
          else next(null, []);
        });
      },
      function (amendments, next){
        node.hdc.transactions.lasts(100, next);
      }
    ], function (err, result) {
      if(err){
        res.send(500, err);
        return;
      }

      result.transactions.forEach(function (tx) {
        var sum = 0;
        var hdcTX = jsonTxToHDC(tx);
        var coins = hdcTX.getCoins();
        coins.forEach(function (coin) {
          var am = contract.getNumber(coin.amNumber);
          if (am && am.coinBase != null) {
            sum += coinValue(am, coin.coinNumber);
          }
        });
        tx.sum = sum;
        tx.type = "TRANSFER";
      });

      res.setHeader('Content-type', 'application/json');
      res.send(200, {
        transactions: result.transactions,
        auth: auth
      });
    });
  };

  return this;
}

function jsonTxToHDC (tx) {
  var hdcTX = new hdc.Transaction();
  _(hdcTX).keys().forEach(function (key) {
    if(tx[key]){
      hdcTX[key] = tx[key];
    }
  });
  return hdcTX;
}

function coinValue (am, coinNumber) {
  var power = parseInt(am.coinBase);
  var left = coinNumber + 1;
  am.coinList.forEach(function(qty){
    if (left > qty) {
      left -= qty;
      power++;
    }
  });
  return Math.pow(2, power);
}
