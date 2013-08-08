
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', {
    currency: 'beta_brousoufs',
    membersCount: 0,
    amendmentsCount: 0,
    transactionsCount: 0
  });
};