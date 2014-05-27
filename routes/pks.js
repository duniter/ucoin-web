var async = require('async');
var fs    = require('fs');

module.exports = function (node, auth) {
  
  this.lookup = function(req, res){
    node.pks.lookup('', function (err, json) {
      if(err){
        res.send(500, err);
        return;
      }

      var keys = [];
      json.keys.forEach(function (key) {
        keys.push(key);
      });

      res.setHeader('Content-type', 'application/json');
      res.send(200, {
        keys: keys,
        auth: auth
      });
    });
  };
  
  this.udid2 = function(req, res){
    res.render('community/pks/udid2', {
      auth: auth
    });
  };
  
  this.add = {

    get: function(req, res){
      res.render('community/pks/add', {
        auth: auth,
        success: '',
        error: ''
      });
    },
    
    post: function(req, res){
      var success = 'your key has been updated';
      var error = '';
      var key = '';
      async.waterfall([
        function (next){
          if(!req.files){
            next('not file sent');
            return;
          }
          if(!req.files.keyfile || req.files.keyfile.size == 0){
            next('no public key sent');
            return;
          }
          next(null, req.files.keyfile.path);
        },
        function (keyPath, next){
          fs.readFile(keyPath, 'utf8', next);
        },
        function (keyData, next){
          key = keyData;
          var sign = null;
          if(~key.indexOf('-----BEGIN PGP SIGNATURE-----')){
            sign = key.substr(key.indexOf('-----BEGIN PGP SIGNATURE-----'));
            key = key.substr(0, key.indexOf('-----BEGIN PGP SIGNATURE-----'));
          }
          if(~key.indexOf('-----BEGIN PGP MESSAGE-----')){
            sign = key.substr(key.indexOf('-----BEGIN PGP MESSAGE-----'));
            key = key.substr(0, key.indexOf('-----BEGIN PGP MESSAGE-----'));
          }
          if(!sign && req.files.sigfile && req.files.sigfile.size > 0){
            async.waterfall([
              function (done){
                fs.readFile(req.files.sigfile.path, 'utf8', done);
              }
            ], function (err, sigData) {
              next(null, sigData);
            });
          }
          else if(!sign){
            next('no signature found');
          }
          else next(null, sign);
        },
        function (sigData, next) {
          if(arguments.length == 1){
            next = sigData;
            sigData = '';
          }
          node.pks.add(key, sigData, next);
        }
      ], function (err, result) {
        if(err){
          error = err;
          success = '';
        }
        else{
          if(result.name){
            var name = result.name || '';
            var comment = result.comment ? ' (' + result.comment + ')' : '';
            var email = result.email ? ' <' + result.email + '>' : '';
            success = 'saved key of ' + name + comment + email;
          }
        }
        res.render('community/pks/add', {
          auth: auth,
          success: success,
          error: error
        });
      });
    }
  };

  return this;
}
