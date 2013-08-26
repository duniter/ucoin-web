var async = require('async');
var sha1  = require('sha1');
var fs    = require('fs');
var _     = require('underscore');

module.exports = function (node, auth) {
  
  this.current = function(req, res){
    async.waterfall([
      function (next){
        node.hdc.amendments.current(function (err, am) {
          if(am){
            getPrevious(am, [am], next);
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

  function getPrevious (am, stack, done) {
    node.hdc.amendments.view.self(am.number-1, am.previousHash, function (err, previous) {
      if(previous){
        stack.push(previous);
        if(previous.number > 0)
          getPrevious(previous, stack, done);
        else
          done(null, stack);
      }
      else done(null, stack);
    });
  }
  
  this.pending = function(req, res){
    node.hdc.amendments.current(function (err, json) {
      res.render('contract/pending', {
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
