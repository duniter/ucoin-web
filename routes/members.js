var async = require('async');
var fs    = require('fs');
var _     = require('underscore');
var sha1  = require('sha1');

module.exports = function (node, auth) {
  
  this.list = function(req, res){
    var status = {};
    async.waterfall([
      function (next){
        node.hdc.amendments.current(function (err, am) {
          if(am){
            node.hdc.amendments.view.memberships(am.number, sha1(am.raw).toUpperCase(), { extract: true }, function (err, mems) {
              next(err, mems.merkle.leaves || {});
            });
          }
          else next(null, { merkle: {} });
        });
      },
      function (mems, next){
        var indexes = [];
        _(mems).each(function (item, index) {
          indexes.push(index);
        });
        async.forEach(indexes, function(index, callback){
          var item = mems[index].value;
          status[item.issuer] = { membership: item.request };
          node.pks.lookup('0x' + item.issuer, function (err, json) {
            if(json.keys.length == 0){
              callback('Member\'s public key with FPR ' + '0x' + item.issuer + ' not stored!');
              return;
            }
            status[item.issuer].key = json.keys[0];
            callback(err);
          });
        }, next);
      }
    ], function (err) {
      console.log(status);
      res.render('community/list', {
        status: _(status).values(),
        auth: auth
      });
    });
  };
  
  this.pendingMemberships = function(req, res){
    var status = {};
    async.waterfall([
      function (next){
        node.hdc.community.memberships({ extract: true }, function (err, mems) {
          next(err, mems.merkle.leaves || {});
        });
      },
      function (mems, next){
        var indexes = [];
        _(mems).each(function (item, index) {
          indexes.push(index);
        });
        async.forEach(indexes, function(index, callback){
          var item = mems[index].value;
          status[item.issuer] = { membership: item.request };
          node.pks.lookup('0x' + item.issuer, function (err, json) {
            if(json.keys.length == 0){
              callback('Member\'s public key with FPR ' + '0x' + item.issuer + ' not stored!');
              return;
            }
            status[item.issuer].key = json.keys[0];
            callback(err);
          });
        }, next);
      }
    ], function (err) {
      console.log(status);
      res.render('community/list', {
        status: _(status).values(),
        auth: auth
      });
    });
  };

  return this;
}
