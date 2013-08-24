var async = require('async');
var sha1  = require('sha1');
var fs    = require('fs');

module.exports = function (node, auth) {
  
  this.current = function(req, res){
    async.waterfall([
      function (next){
        node.hdc.amendments.current(next);
      },
      function (current, next){
        getPrevious(current, [current], next);
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
      stack.push(previous);
      if(previous.number > 0)
        getPrevious(previous, stack, done);
      else
        done(null, stack);
    });
  }
  
  this.pending = function(req, res){
    node.hdc.amendments.current(function (err, json) {
      if(err){
        res.send(500, err);
        return;
      }

      res.render('contract/pending', {
        auth: auth
      });
    });
  };

  return this;
}
