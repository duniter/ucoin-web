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

var confFile = __dirname + '/conf/config.json';
var config = fs.existsSync(confFile) ? JSON.parse(fs.readFileSync(confFile, 'utf8')) : {};

var host     = program.uchost || config.uchost || 'localhost';
var port     = program.ucport || config.ucport || 8081;
var app_port = program.port || config.port || 3081;
var app_host = program.host || config.host || 'localhost';
var auth     = program.auth || config.auth || false;

host = host.match(/:/) ? '[' + host + ']' : host;

vucoin(host, port, function (err, node) {

  var app = express();

  // all environments
  app.set("view options", {layout: false});
  app.set('port', process.env.PORT || 3000);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(app.router);

  // development only
  if ('development' == app.get('env')) {
    app.use(express.errorHandler());
  }

  var nodeURI = "http://" + host + ':' + port;

  var routes       = require('./routes/index')(node, auth);
  var members      = require('./routes/members')(node, auth);
  var pks          = require('./routes/pks')(node, auth);
  var contract     = require('./routes/contract')(node, auth, nodeURI);
  var transactions = require('./routes/transactions')(node, auth);
  var peers        = require('./routes/peers')(node, auth);
  var blockchain   = require('./routes/blockchain')(node, auth);
  
  app.get('/home', routes.home);
  app.get('/community/members',             members.members);
  app.get('/community/voters',              members.voters);
  app.get('/community/pks/lookup',          pks.lookup);
  app.get('/community/pks/add',             pks.add.get);
  app.post('/community/pks/add',            pks.add.post);
  app.get('/community/pks/udid2',           pks.udid2);
  app.get('/blockchain/graphs',             contract.graphs);
  app.get('/blockchain/wotgraphs',          contract.graphs);
  app.get('/blockchain/txgraphs',           contract.graphs);
  app.get('/contract/current',              contract.current);
  app.get('/contract/pending',              contract.pending);
  app.get('/contract/votes',                contract.votes);
  app.get('/transactions/lasts',            transactions.lasts);
  app.get('/peering/peers',                 peers.knownPeers);
  app.get('/peering/peers/keys',            peers.managedKeys);
  app.get('/peering/wallets',               peers.wallets);
  app.get('/peering/upstream',              peers.upstreamALL);
  app.get('/peering/peers/upstream/keys',   peers.upstreamKEYS);
  app.get('/peering/downstream',            peers.downstreamALL);
  app.get('/peering/peers/downstream/keys', peers.downstreamKEYS);
  app.get('/blockchain/block/:number',      blockchain.block);

  http.createServer(app).listen(app_port, app_host, function(){
    console.log('Web interface: http://' + app_host + ':' + app_port);
    console.log('vuCoin listening interface ' + host + ' on port ' + port);
    if(auth){
      console.log('Running secure mode');
    }
  });

});
