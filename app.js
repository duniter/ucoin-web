var express = require('express');
var http    = require('http');
var path    = require('path');
var fs      = require('fs');
var vucoin  = require('vucoin');
var program = require('commander');

program
  .option('-p, --port <port>', 'Local port to listen', parseInt)
  .option('-h, --host <host>', 'Local interface to listen')
  .option('-H, --uchost <host>', 'Host of ucoin server')
  .option('-P, --ucport <port>', 'Port of ucoin server')
  .option('-a, --auth', 'Enables authenticated mode')
  .parse(process.argv);

var confFile = 'conf/config.json';
var config = fs.existsSync(confFile) ? JSON.parse(fs.readFileSync(confFile, 'utf8')) : {};

var host     = program.uchost || config.uchost || 'localhost';
var port     = program.ucport || config.ucport || 8081;
var app_port = program.port || config.port || 3081;
var app_host = program.host || config.host || 'localhost';
var auth     = program.auth || config.auth || false;

host = host.match(/:/) ? '[' + host + ']' : host;

vucoin(host, port, auth, function (err, node) {

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

  var routes = require('./routes/index')(node, auth);
  var pks    = require('./routes/pks')(node, auth);

  app.get('/', routes.index);
  app.get('/pks', pks.lookup);

  http.createServer(app).listen(app_port, app_host, function(){
    console.log('Express server listening interface ' + app_host + ' on port ' + app_port);
  });

});
