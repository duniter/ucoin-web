var async    = require('async');
var sha1     = require('sha1');
var fs       = require('fs');
var _        = require('underscore');
var contract = require('../tools/contract');

module.exports = function (node, auth) {
  
  this.current = function(req, res){
    async.waterfall([
      function (next){
        node.hdc.amendments.current(function (err, am) {
          if(am){
            contract.getStack(am, node, next);
          }
          else next(null, []);
        });
      }
    ], function (err, amendments) {
      if(err){
        res.send(500, err);
        return;
      }

      amendments.forEach(function (am) {
        am.hash = sha1(am.raw).toUpperCase();
      });

      res.render('contract/current', {
        amendments: amendments,
        auth: auth
      });
    });
  };
  
  this.pending = function(req, res){
    async.waterfall([
      function (next){
        node.hdc.amendments.current(function (err, am) {
          next(null, am ? am.number : -1);
        });
      },
      function (currentNumber, next){
        node.ucs.amendment.proposed(currentNumber + 1, function (err, am) {
          next(null, am ? [am] : []);
        });
      },
    ], function (err, amendments) {
      if(err){
        res.send(500, err);
        return;
      }

      amendments.forEach(function (am) {
        am.hash = sha1(am.raw).toUpperCase();
      });

      res.render('contract/pending', {
        amendments: amendments,
        auth: auth
      });
    });
  };
  
  this.votes = function(req, res){
    node.hdc.amendments.votes.get(function (err, json) {
      if(err){
        res.send(500, err);
        return;
      }

      var numbers = [];
      _(json.amendments).each(function (hashes, num) {
        numbers.push({
          index: num,
          hashes: []
        });
        _(hashes).each(function (count, hash) {
          numbers[numbers.length-1].hashes.push({
            hash: hash,
            count: count
          });
        });
      });

      numbers.reverse();
      res.render('contract/votes', {
        numbers: numbers,
        auth: auth
      });
    });
  };

  return this;
}
