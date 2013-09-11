
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Global English Table Tennis Tournament' });
};