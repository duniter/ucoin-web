var express = require('express');
var http    = require('http');
var path    = require('path');
var fs      = require('fs');
var vucoin  = require('vucoin');
var program = require('commander');
var engine  = require('ejs-locals');

program
  .option('-p, --port <port>', 'Local port to listen', parseInt)
  .option('-h, --host <host>', 'Local interface to listen')
  .option('-H, --uchost <host>', 'Host of ucoin server')
  .option('-P, --ucport <port>', 'Port of ucoin server')
  .option('-a, --auth', 'Enables authenticated mode')
  .parse(process.argv);

var confFile = __dirname + '/conf/config.json';
var config = fs.existsSync(confFile) ? JSON.parse(fs.readFileSync(confFile, 'utf8')) : {};

var host     = program.uchost || config.uchost || 'localhost';
var port     = program.ucport || config.ucport || 8081;
var app_port = program.port || config.port || 3081;
var app_host = program.host || config.host || 'localhost';
var auth     = program.auth || config.auth || false;

host = host.match(/:/) ? '[' + host + ']' : host;

vucoin(host, port, auth, function (err, node) {

  var app = express();

  app.engine('ejs', engine);

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

  var routes       = require('./routes/index')(node, auth);
  var members      = require('./routes/members')(node, auth);
  var pks          = require('./routes/pks')(node, auth);
  var contract     = require('./routes/contract')(node, auth);
  var transactions = require('./routes/transactions')(node, auth);
  var peers        = require('./routes/peers')(node, auth);

  app.get('/', routes.index);
  app.get('/cap', routes.capabilities);
  app.get('/community/current', members.list);
  app.get('/community/voters', members.voters);
  app.get('/community/pks/lookup', pks.lookup);
  app.get('/community/pks/add', pks.add.get);
  app.post('/community/pks/add', pks.add.post);
  app.get('/community/pks/udid2', pks.udid2);
  app.get('/contract/current', contract.current);
  app.get('/contract/pending', contract.pending);
  app.get('/contract/votes', contract.votes);
  app.get('/tx/lasts', transactions.lasts);
  app.get('/peers', peers.knownPeers);
  app.get('/peers/keys', peers.managedKeys);
  app.get('/peers/tht', peers.tht);
  app.get('/peers/upstream/main', peers.upstreamALL);
  app.get('/peers/upstream/keys', peers.upstreamKEYS);
  app.get('/peers/downstream/main', peers.downstreamALL);
  app.get('/peers/downstream/keys', peers.downstreamKEYS);

  http.createServer(app).listen(app_port, app_host, function(){
    console.log('Express server listening interface ' + app_host + ' on port ' + app_port);
    console.log('vuCoin listening interface ' + host + ' on port ' + port);
    if(auth){
      console.log('Running secure mode');
    }
  });

});
