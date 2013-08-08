var async = require('async');

module.exports = function (node) {
  
  this.lookup = function(req, res){
    node.pks.lookup('', function (err, json) {
      res.render('pks', {
        keys: json.keys
      });
    });
  };

  return this;
}
