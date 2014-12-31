
var ucoinApp = angular.module('ucoinApp', [
  'ngRoute',
  'ucoinControllers'
]);

var currency_acronym = "..";
var relative_acronym = "UD";

var routes = {
  'homeController': {
    model: 'partials/container.html',
    bodies: {
      '/home': 'home',
      '/graphs': 'currency-graphs',
      '/parameters': 'parameters',
      '/tech': 'tech'
    }
  },
  'communityController': {
    model: 'partials/container2.html',
    bodies: {
      '/community/members': 'community-members',
      '/community/voters': 'community-members',
      '/community/pks/lookup': 'community-lookup',
      '/community/pks/add': 'community-members',
      '/community/pks/udid2': 'community-udid2',
    }
  },
  'contractController': {
    model: 'partials/container.html',
    bodies: {
      '/blockchain/graphs': 'blockchain-graphs',
      '/blockchain/wotgraphs': 'blockchain-wotgraphs',
      '/blockchain/txgraphs': 'blockchain-txgraphs',
      '/contract/current': 'contract-current',
      '/contract/pending': 'contract-current',
      '/contract/votes': 'contract-votes',
    }
  },
  'transactionsController': {
    model: 'partials/container.html',
    bodies: {
      '/transactions/lasts': 'transactions-lasts',
    }
  },
  'peersController': {
    model: 'partials/container2.html',
    bodies: {
      '/peering/peers': 'peering-peers',
      '/peering/wallets': 'peering-wallets',
      '/peering/upstream': 'peering-peers',
      '/peering/downstream': 'peering-peers',
    }
  },
};

ucoinApp.config(['$routeProvider',
  function($routeProvider) {
    $.each(routes, function(controllerName, controller){
      $.each(controller.bodies, function(bodyPath, bodyName){
        $routeProvider.when(bodyPath, {
          templateUrl: controller.model,
          controller: controllerName,
          path: bodyName
        });
      });
    });
    $routeProvider.
      otherwise({
        redirectTo: '/home'
      });
  }
]);

var ucoinControllers = angular.module('ucoinControllers', []);

ucoinControllers.controller('homeController', function ($scope, $route, $location, $http, $timeout) {
  
  $scope.currency_acronym = currency_acronym;
  $scope.relative_acronym = relative_acronym;
  $http.get('/home').success(function (data) {
    $.each(data, function (key, value) {
      $scope[key] = value;
    });

    if (~['/graphs', '/home'].indexOf($location.path())) {

      var dt = data.parameters.dt;
      var ud0 = data.parameters.ud0;
      var masses = [];
      var members = [];
      var uds = [];
      var nbUDs = [];
      var nbUDsOnUD = [];
      var mMassUDM = [];
      var cActuals = [];
      var firstTime = 0
      data.blocks.forEach(function (b, index) {
        if (!firstTime) {
          firstTime = parseInt(b.medianTime);
        }
        var i = masses.length;
        var UD = b.dividend;
        var N = b.membersCount;
        var M = b.monetaryMass-UD*N;
        var c = b.medianTime == firstTime ? 10000 : UD*N/M;
        members.push(N);
        uds.push(UD);
        masses.push(M);
        cActuals.push(c*100);
        nbUDs.push(Math.round(M / UD));
        mMassUDM.push(parseFloat((Math.round(M / UD) / N).toFixed(2)));
        nbUDsOnUD.push(1);
        // mMassUDM.push((masses[i]/uds[i])/b.membersCount);
      });

      $timeout(function () {
        if (~['/graphs', '/home'].indexOf($location.path())) {
          genererGrapheMMassUDM(firstTime, dt, mMassUDM, members, $scope.currency_acronym);
        }
        if (~['/graphs'].indexOf($location.path())) {
          genererGrapheCactual(firstTime, dt, uds, cActuals, members, $scope.currency_acronym);
          genererGrapheQuantitative(firstTime, dt, uds, masses, $scope.currency_acronym);
          genererGrapheRelative(firstTime, dt, nbUDsOnUD, nbUDs, $scope.currency_acronym);
        }
        $scope.isNotLoading = true;
      }, 500);
    } else {
      $scope.isNotLoading = true;
    }
  });

  $scope.path = $route.current.path;
  $scope.menus = [{
    title: 'Overview',
    icon: 'picture',
    href: '#/home'
  },{
    title: 'Currency graphs',
    icon: 'stats',
    href: '#/graphs'
  },{
    title: 'Parameters',
    icon: 'wrench',
    href: '#/parameters'
  },{
    title: 'Peer informations',
    icon: 'globe',
    href: '#/tech'
  }];

  $scope.selectedIndex = [
    '/home',
    '/graphs',
    '/parameters',
    '/tech',
  ].indexOf($location.path());

  $scope.home = true;
});


ucoinControllers.controller('communityController', function ($scope, $route, $location, $http, $timeout) {

  $scope.currency_acronym = currency_acronym;
  $scope.relative_acronym = relative_acronym;
  var forMenus = {
    '/community/members':    { menuIndex: 0, subIndex: 0 },
    '/community/voters':     { menuIndex: 0, subIndex: 1 },
    '/community/pks/lookup': { menuIndex: 1, subIndex: 0 },
    '/community/pks/add':    { menuIndex: 1, subIndex: 1 },
    '/community/pks/udid2':  { menuIndex: 1, subIndex: 1 },
  }
  $scope.selectedParentIndex = forMenus[$location.path()].menuIndex;
  $scope.selectedIndex = forMenus[$location.path()].subIndex;
  $scope.community = true;

  if (~['/community/members',
        '/community/voters',
        '/community/pks/lookup'].indexOf($location.path())) {
    $http.get($location.path()).success(function (data) {
      console.log(data);
      $.each(data, function (key, value) {
        $scope[key] = value;
      });

      if ($location.path() == '/community/pks/lookup') {
        $timeout(function () {
          $scope.isNotLoading = true;
          wotGraph('#wot', data.links);
        }, 500);
      }
      else if ($location.path() == '/community/members') {
        $timeout(function () {
          var bidirectionnals = {};
          data.wot.forEach(function (source) {
            data.wot.forEach(function (target) {
              if (~target.imports.indexOf(source.name) && ~source.imports.indexOf(target.name)) {
                bidirectionnals[source.name] = bidirectionnals[source.name] || [];
                bidirectionnals[source.name].push(target.name);
              }
            });
          });
          $scope.isNotLoading = true;
          wotGraph2('#wot2', data.wot, bidirectionnals);
        }, 500);
      }
      else {
        $scope.isNotLoading = true;
      }
    });
  } else {
    $scope.isNotLoading = true;
  }
  
  $scope.path = $route.current.path;

  $scope.menus = [{
    title: 'Members',
    submenus: [{
      title: 'Members',
      icon: 'user',
      href: '#/community/members'
    }
    // ,{
    //   title: 'Voters',
    //   icon: 'user',
    //   href: '#/community/voters'
    // }
    ]
  }
  // ,{
  //   title: 'Public keys',
  //   submenus: [{
  //     title: 'Lookup',
  //     icon: 'search',
  //     href: '#/community/pks/lookup'
  //   },{
  //     title: 'Generate udid2',
  //     icon: 'barcode',
  //     href: '#/community/pks/udid2'
  //   }]
  // }
  ];
});

ucoinControllers.controller('contractController', function ($scope, $route, $location, $http, $timeout) {

  $scope.currency_acronym = currency_acronym;
  $scope.relative_acronym = relative_acronym;
  $scope.selectedIndex = [
    '/blockchain/graphs',
    '/blockchain/wotgraphs',
    '/blockchain/txgraphs',
    '/contract/current',
    '/contract/pending',
    '/contract/votes'
  ].indexOf($location.path());

  if (~['/blockchain/graphs',
        '/blockchain/wotgraphs',
        '/blockchain/txgraphs',
        '/contract/current',
        '/contract/pending',
        '/contract/votes'].indexOf($location.path())) {
    $http.get($location.path()).success(function (data) {
      console.log(data);
      $.each(data, function (key, value) {
        $scope[key] = value;
      });

      $timeout(function() {
        if (~['/blockchain/graphs'].indexOf($location.path())) {
          var minSpeeds = [], maxSpeeds = [];
          data.speed.forEach(function () {
            minSpeeds.push(data.parameters.avgGenTime*4);
            maxSpeeds.push(data.parameters.avgGenTime/4);
          });
          timeGraphs('#timeGraph', data.accelerations, data.medianTimeIncrements, data.speed, minSpeeds, maxSpeeds);
          issuersGraphs('#issuersGraph', data.nbDifferentIssuers, data.parameters);
          difficultyGraph('#difficultyGraph', data.difficulties);

          // Comboboxes
          var textField1 = $("#textFieldBlock1");
          var textField2 = $("#textFieldBlock2");
          var last1Button = $("#buttonLast1");
          var last2Button = $("#buttonLast2");
          var allButton = $("#buttonAll");
          var last1 = 100, last2 = 300;
          last1Button.click(function () {
            textField1.val(Math.max(0, data.speed.length - last1));
            textField2.val(data.speed.length - 1);
            textField2.trigger('change');
          });
          last2Button.click(function () {
            textField1.val(Math.max(0, data.speed.length - last2));
            textField2.val(data.speed.length - 1);
            textField2.trigger('change');
          });
          allButton.click(function () {
            textField1.val(0);
            textField2.val(data.speed.length - 1);
            textField2.trigger('change');
          });
          textField1.change(majGraphes);
          textField2.change(majGraphes);
          last1Button.trigger('click');

          function majGraphes () {
            $("#timeGraph").highcharts().xAxis[0].setExtremes(parseFloat(textField1.val()), parseFloat(textField2.val()));
            $("#issuersGraph").highcharts().xAxis[0].setExtremes(parseFloat(textField1.val()), parseFloat(textField2.val()));
            $("#difficultyGraph").highcharts().xAxis[0].setExtremes(parseFloat(textField1.val()), parseFloat(textField2.val()));
          }
        }
        if (~['/blockchain/wotgraphs'].indexOf($location.path())) {
          wotGraphs('#wotGraph', data.members, data.newcomers, data.actives, data.leavers, data.excluded);
          certsGraph('#certsGraph', data.certifications);
        }
        if (~['/blockchain/txgraphs'].indexOf($location.path())) {
          txsGraphs('#txsGraph', data.transactions);
          outputVolumeGraph('#outputVolumeGraph', data.outputs, data.outputsEstimated);
        }
        $scope.isNotLoading = true;
        // estimatedOutputVolumeGraph('#estimatedOutputVolumeGraph', data.outputsEstimated);
      }, 500);
    });
  }
  
  $scope.path = $route.current.path;
  $scope.menus = [{
    title: 'Technical graphs',
    icon: 'stats',
    href: '#/blockchain/graphs'
  },{
    title: 'WoT graphs',
    icon: 'globe',
    href: '#/blockchain/wotgraphs'
  },{
    title: 'Transactions graphs',
    icon: 'transfer',
    href: '#/blockchain/txgraphs'
  }
  // ,{
  //   title: 'Current',
  //   icon: 'list-alt',
  //   href: '#/contract/current'
  // },{
  //   title: 'Pending',
  //   icon: 'time',
  //   href: '#/contract/pending'
  // },{
  //   title: 'Votes',
  //   icon: 'envelope',
  //   href: '#/contract/votes'
  // }
  ];
  $scope.contract = true;

  if($location.path() == "/contract/current") {
    $scope.errorMessage = "Contract is currently empty!";
    $scope.errorAddition = "it will be initialized once a vote is received.";
  }

  if($location.path() == "/contract/pending") {
    $scope.errorMessage = "This node is not proposing any amendment!";
    $scope.errorAddition = "";
  }
});

ucoinControllers.controller('transactionsController', function ($scope, $route, $location, $http) {

  $scope.currency_acronym = currency_acronym;
  $scope.relative_acronym = relative_acronym;
  $scope.selectedIndex = [
    '/transactions/lasts'
  ].indexOf($location.path());

  if (~['/transactions/lasts'].indexOf($location.path())) {
    $http.get($location.path()).success(function (data) {
      console.log(data);
      $.each(data, function (key, value) {
        $scope[key] = value;
      });

      $scope.transactions.forEach(function(tx){
        tx.coins.forEach(function(coin, index){
          var split = coin.split(':');
          tx.coins[index] = {
            id: split[0],
            tx: split[1]
          };
        });
      });

      $scope.isNotLoading = true;
    });
  }
  
  $scope.path = $route.current.path;
  $scope.menus = [{
    title: 'Last received',
    icon: 'fire',
    href: '#/transactions/lasts'
  }];
  $scope.transaction = true;
  $scope.errorMessage = "No transactions received yet!";
});

ucoinControllers.controller('peersController', function ($scope, $route, $location, $http) {

  $scope.currency_acronym = currency_acronym;
  $scope.relative_acronym = relative_acronym;
  var forMenus = {
    '/peering/peers':      { menuIndex: 0, subIndex: 0 },
    '/peering/wallets':    { menuIndex: 0, subIndex: 1 },
    '/peering/upstream':   { menuIndex: 1, subIndex: 0 },
    '/peering/downstream': { menuIndex: 1, subIndex: 1 },
  }
  $scope.selectedParentIndex = forMenus[$location.path()].menuIndex;
  $scope.selectedIndex = forMenus[$location.path()].subIndex;

  if (~['/peering/peers',
        '/peering/wallets',
        '/peering/upstream',
        '/peering/downstream'].indexOf($location.path())) {
    $http.get($location.path()).success(function (data) {
      console.log(data);
      $.each(data, function (key, value) {
        $scope[key] = value;
      })

      $scope.peers && $scope.peers.forEach(function(p){
        p.keyID = '0x' + p.fingerprint.substring(24);
      });

      $scope.wallets && $scope.wallets.forEach(function(w){
        w.keyID = '0x' + w.fingerprint.substring(24);
      });

      $scope.isNotLoading = true;
    });
  }
  
  $scope.path = $route.current.path;
  $scope.menus = [{
    title: 'Peering',
    submenus: [{
      title: 'Known peers',
      icon: 'globe',
      href: '#/peering/peers'
    },{
      title: 'Wallets',
      icon: 'lock',
      href: '#/peering/wallets'
    }]
  },{
    title: 'Routing',
    submenus: [{
      title: 'Upstream (incoming data)',
      icon: 'cloud-download',
      href: '#/peering/upstream'
    },{
      title: 'Downstream (outcoming data)',
      icon: 'cloud-download',
      href: '#/peering/downstream'
    }]
  }];
  $scope.isPeers = true;
});
