var async = require('async');
var sha1  = require('sha1');
var fs    = require('fs');
var _     = require('underscore');
var hdc   = require('hdc');

module.exports = function (node, auth) {

  this.knownPeers = function(done){
    async.waterfall([
      function (next){
        node.network.peering.peers.get({ leaves: true }, next);
      },
      function (merkle, next) {
        var peers = [];
        async.forEach(merkle.leaves, function(fingerprint, callback){
          async.waterfall([
            function (next){
              node.network.peering.peers.get({ leaf: fingerprint }, next);
            },
            function(json, next){
              var peer = (json.leaf && json.leaf.value) || {};
              peers.push(peer);
              next();
            },
          ], callback);
        }, function (err) {
          next(null, peers);
        });
      }
    ], done);
  };
  
  this.managedKeys = function(req, res){
    async.waterfall([
      function (next){
        node.network.peering.keys({ leaves: true}, next);
      },
      function (merkle, next) {
        next(null, merkle.leaves);
      }
    ], function (err, keys) {
      if(err){
        res.send(500, err);
        return;
      }

      res.setHeader('Content-type', 'application/json');
      res.send(200, {
        keys: keys || [],
        auth: auth
      });
    });
  };
  
  this.wallets = function(req, res){
    async.waterfall([
      function (next){
        node.network.wallet.get({ leaves: true}, next);
      },
      function (merkle, next) {
        var wallets = [];
        async.forEach(merkle.leaves, function(hash, callback){
          async.waterfall([
            function(next){
              node.network.wallet.get({ leaf: hash }, next);
            },
            function (merkle, next){
              wallets.push(merkle.leaf.value.entry);
              next(null);
            },
          ], callback);
        }, function(err){
          next(err, wallets);
        });
      }
    ], function (err, wallets) {
      if(err){
        res.send(500, err);
        return;
      }

      res.setHeader('Content-type', 'application/json');
      res.send(200, {
        wallets: wallets || [],
        auth: auth
      });
    });
  };
  
  this.upstreamALL = function(req, res){
    async.waterfall([
      function (next){
        node.network.peering.peers.upstream.get(next);
      },
      fingerprintsToPeers
    ], function (err, peers) {
      if(err){
        res.send(500, err);
        return;
      }
      res.setHeader('Content-type', 'application/json');
      res.send(200, {
        subtitle: 'ALL Upstream',
        peers: peers || [],
        auth: auth
      });
    });
  };
  
  this.upstreamKEYS = function(req, res){
    async.waterfall([
      function (next){
        node.network.peering.keys({ leaves: true }, next);
      },
      function (merkle, next) {
        var keys = {};
        async.forEach(merkle.leaves, function(k, callback){
          node.network.peering.peers.upstream.of(k, function (err, json) {
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

      res.setHeader('Content-type', 'application/json');
      res.send(200, {
        subtitle: 'Upstreams by key',
        keys: keys || [],
        auth: auth
      });
    });
  };
  
  this.downstreamALL = function(req, res){
    async.waterfall([
      function (next){
        node.network.peering.peers.downstream.get(next);
      },
      fingerprintsToPeers
    ], function (err, peers) {
      if(err){
        res.send(500, err);
        return;
      }

      res.setHeader('Content-type', 'application/json');
      res.send(200, {
        subtitle: 'ALL Downstream',
        peers: peers || [],
        auth: auth
      });
    });
  };
  
  this.downstreamKEYS = function(req, res){
    async.waterfall([
      function (next){
        node.network.peering.keys({ leaves: true }, next);
      },
      function (merkle, next) {
        var keys = {};
        async.forEach(merkle.leaves, function(k, callback){
          node.network.peering.peers.downstream.of(k, function (err, json) {
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

      res.setHeader('Content-type', 'application/json');
      res.send(200, {
        subtitle: 'Downstreams by key',
        keys: keys || [],
        auth: auth
      });
    });
  };

  function fingerprintsToPeers (json, next) {
    var peers = [];
    async.forEach(json.peers, function(hash, callback){
      async.waterfall([
        function(next){
          node.network.peering.peers.get({ leaf: hash }, next);
        },
        function (merkle, next){
          peers.push(merkle.leaf.value);
          next(null);
        },
      ], callback);
    }, function(err){
      next(err, peers);
    });
  }

  return this;
}
