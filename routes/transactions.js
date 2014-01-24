var async = require('async');
var sha1  = require('sha1');
var fs    = require('fs');
var _     = require('underscore');
var hdc   = require('hdc');

module.exports = function (node, auth) {
  
  this.lasts = function(req, res){
    async.waterfall([
      function (next){
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
        if(hdcTX.type == 'FUSION'){
          var coin = hdcTX.getCoins()[0];
          sum = coin.base * Math.pow(10, coin.power);
        }
        else if(hdcTX.type == 'TRANSFER'){
          var coins = hdcTX.getCoins();
          coins.forEach(function (coin) {
            sum += coin.base * Math.pow(10, coin.power);
          });
        }
        else {
          var coins = hdcTX.getCoins();
          coins.forEach(function (coin) {
            if (coin.transaction) {
              sum += coin.base * Math.pow(10, coin.power);
            }
          });
        }
        tx.sum = sum;
      });

      res.render('transactions/lasts', {
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
  hdcTX.coins = [];
  tx.coins.forEach(function (coin) {
    hdcTX.coins.push(coin.id + ', ' + coin.transaction_id);
  });
  return hdcTX;
}
