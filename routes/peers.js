var async = require('async');
var sha1  = require('sha1');
var fs    = require('fs');
var _     = require('underscore');
var hdc   = require('hdc');

module.exports = function (node, auth) {
  
  this.knownPeers = function(req, res){
    async.waterfall([
      function (next){
        node.ucg.peering.peers.get({ extract: true }, next);
      },
      function (merkle, next) {
        var peers = [];
        _(merkle.leaves).keys().forEach(function (key) {
          peers.push(merkle.leaves[key].value);
        });
        next(null, peers);
      }
    ], function (err, peers) {
      if(err){
        res.send(500, err);
        return;
      }

      res.render('peers/stream/all', {
        subtitle: 'Known peers',
        peers: peers || [],
        auth: auth
      });
    });
  };
  
  this.managedKeys = function(req, res){
    async.waterfall([
      function (next){
        node.ucg.peering.keys({extract:true}, next);
      },
      function (merkle, next) {
        var keys = [];
        _(merkle.leaves).keys().forEach(function (key) {
          keys.push(merkle.leaves[key].value);
        });
        next(null, keys);
      }
    ], function (err, keys) {
      if(err){
        res.send(500, err);
        return;
      }

      res.render('peers/managed', {
        keys: keys || [],
        auth: auth
      });
    });
  };
  
  this.tht = function(req, res){
    async.waterfall([
      function (next){
        node.ucg.tht.get({extract:true}, next);
      },
      function (merkle, next) {
        var tht = [];
        _(merkle.leaves).keys().forEach(function (key) {
          tht.push(merkle.leaves[key].value.entry);
        });
        next(null, tht);
      }
    ], function (err, tht) {
      if(err){
        res.send(500, err);
        return;
      }

      res.render('peers/tht', {
        tht: tht || [],
        auth: auth
      });
    });
  };
  
  this.upstreamALL = function(req, res){
    async.waterfall([
      function (next){
        node.ucg.peering.peers.upstream.get(next);
      }
    ], function (err, result) {
      if(err){
        res.send(500, err);
        return;
      }

      res.render('peers/stream/all', {
        subtitle: 'ALL Upstream',
        peers: result.peers || [],
        auth: auth
      });
    });
  };
  
  this.upstreamKEYS = function(req, res){
    async.waterfall([
      function (next){
        node.ucg.peering.keys({extract:true}, next);
      },
      function (merkle, next) {
        var keys = {};
        async.forEach(_(merkle.leaves).keys(), function(merkleKey, callback){
          var k = merkle.leaves[merkleKey].value;
          node.ucg.peering.peers.upstream.of(k, function (err, json) {
            if(!err && json.peers && json.peers.length > 0)
              keys[k] = json.peers;
            callback();
          });
        }, function(err){
          next(null, keys);
        });
      },
      function (keys, next) {
        var sortedFinal = [];
        var sortedKeys = _(keys).keys();
        sortedKeys.sort();
        sortedKeys.forEach(function (k) {
          sortedFinal.push({ key: k, peers: keys[k] });
        });
        next(null, sortedFinal);
      }
    ], function (err, keys) {
      if(err){
        res.send(500, err);
        return;
      }

      res.render('peers/stream/keys', {
        subtitle: 'Upstreams by key',
        keys: keys || [],
        auth: auth
      });
    });
  };
  
  this.downstreamALL = function(req, res){
    async.waterfall([
      function (next){
        node.ucg.peering.peers.downstream.get(next);
      }
    ], function (err, result) {
      if(err){
        res.send(500, err);
        return;
      }

      res.render('peers/stream/all', {
        subtitle: 'ALL Downstream',
        peers: result.peers || [],
        auth: auth
      });
    });
  };
  
  this.downstreamKEYS = function(req, res){
    async.waterfall([
      function (next){
        node.ucg.peering.keys({extract:true}, next);
      },
      function (merkle, next) {
        var keys = {};
        async.forEach(_(merkle.leaves).keys(), function(merkleKey, callback){
          var k = merkle.leaves[merkleKey].value;
          node.ucg.peering.peers.downstream.of(k, function (err, json) {
            if(!err && json.peers && json.peers.length > 0)
              keys[k] = json.peers;
            callback();
          });
        }, function(err){
          next(null, keys);
        });
      },
      function (keys, next) {
        var sortedFinal = [];
        var sortedKeys = _(keys).keys();
        sortedKeys.sort();
        sortedKeys.forEach(function (k) {
          sortedFinal.push({ key: k, peers: keys[k] });
        });
        next(null, sortedFinal);
      }
    ], function (err, keys) {
      if(err){
        res.send(500, err);
        return;
      }

      res.render('peers/stream/keys', {
        subtitle: 'Downstreams by key',
        keys: keys || [],
        auth: auth
      });
    });
  };

  return this;
}
