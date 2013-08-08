var async = require('async');

module.exports = function (node, auth) {
  
  this.index = function(req, res){
    res.render('index', {
      currency: 'beta_brousoufs',
      membersCount: 0,
      amendmentsCount: 0,
      transactionsCount: 0,
      auth: auth
    });
  };

  return this;
}
