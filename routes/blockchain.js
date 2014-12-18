var async    = require('async');
var sha1     = require('sha1');
var fs       = require('fs');
var _        = require('underscore');
var contract = require('../tools/contract');

module.exports = function (node, auth) {
  
  this.block = function(req, res){
    async.waterfall([
      async.apply(node.blockchain.block, req.params.number)
    ], successOr500(res));
  };

  function successOr500 (res) {
    res.setHeader('Content-type', 'application/json');
    return function (err, json) {
      if(err){
        res.send(500, err);
        return;
      }
      res.send(200, json);
    };
  }

  return this;
}
