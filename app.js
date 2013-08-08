var express = require('express');
var config  = require('./conf/config');
var http    = require('http');
var path    = require('path');
var vucoin  = require('vucoin');

console.log(config);

var host = config.host || 'localhost';
var port = config.port || 8081;

host = host.match(/:/) ? '[' + host + ']' : host;

vucoin(host, port, function (err, node) {

  var app = express();

  // all environments
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));

  // development only
  if ('development' == app.get('env')) {
    app.use(express.errorHandler());
  }

  var routes = require('./routes/index')(node);
  var pks    = require('./routes/pks')(node);

  app.get('/', routes.index);
  app.get('/pks', pks.lookup);

  http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
  });

});
