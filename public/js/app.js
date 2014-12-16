
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

ucoinControllers.controller('homeController', function ($scope, $route, $location, $http) {
  
  $scope.currency_acronym = currency_acronym;
  $scope.relative_acronym = relative_acronym;
  $http.get('/home').success(function (data) {
    $.each(data, function (key, value) {
      $scope[key] = value;
    });

    $scope.isNotLoading = true;

    setTimeout(function () {
      var masses = [];
      var uds = [];
      var nbUDs = [];
      var nbUDsOnUD = [];
      var firstTime = 0
      var dt = data.parameters.dt;
      data.blocks.forEach(function (b) {
        var i = masses.length;
        masses.push(b.monetaryMass);
        uds.push(b.dividend);
        nbUDs.push(Math.round(masses[i] / uds[i]));
        nbUDsOnUD.push(1);
        if (!firstTime) {
          firstTime = parseInt(b.medianTime);
        }
      });
      genererGrapheQuantitative(firstTime, dt, uds, masses, $scope.currency_acronym);
      genererGrapheRelative(firstTime, dt, nbUDsOnUD, nbUDs, $scope.currency_acronym);
    }, 100);
  });

  $scope.path = $route.current.path;
  $scope.menus = [{
    title: 'Overview',
    icon: 'picture',
    href: '#/home'
  },{
    title: 'Technical details',
    icon: 'wrench',
    href: '#/tech'
  }];

  $scope.selectedIndex = [
    '/home',
    '/tech',
  ].indexOf($location.path());

  $scope.home = true;
});


ucoinControllers.controller('communityController', function ($scope, $route, $location, $http) {

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

      $scope.isNotLoading = true;

      if ($location.path() == '/community/pks/lookup') {
        setTimeout(function () {
          wotGraph('#wot', data.links);
        }, 100);
      }

      if ($location.path() == '/community/members') {
        setTimeout(function () {
          var bidirectionnals = {};
          data.wot.forEach(function (source) {
            data.wot.forEach(function (target) {
              if (~target.imports.indexOf(source.name) && ~source.imports.indexOf(target.name)) {
                bidirectionnals[source.name] = bidirectionnals[source.name] || [];
                bidirectionnals[source.name].push(target.name);
              }
            });
          });
          wotGraph2('#wot2', data.wot, bidirectionnals);
        }, 100);
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

ucoinControllers.controller('contractController', function ($scope, $route, $location, $http) {

  $scope.currency_acronym = currency_acronym;
  $scope.relative_acronym = relative_acronym;
  $scope.selectedIndex = [
    '/blockchain/graphs',
    '/contract/current',
    '/contract/pending',
    '/contract/votes'
  ].indexOf($location.path());

  if (~['/blockchain/graphs',
        '/contract/current',
        '/contract/pending',
        '/contract/votes'].indexOf($location.path())) {
    $http.get($location.path()).success(function (data) {
      console.log(data);
      $.each(data, function (key, value) {
        $scope[key] = value;
      });

      setTimeout(function() {
        timeGraphs('#timeGraph', data.accelerations, data.medianTimeIncrements);
        wotGraphs('#wotGraph', data.members, data.newcomers, data.actives, data.leavers, data.excluded);
        txsGraphs('#txsGraph', data.transactions);
      }, 10);

      $scope.isNotLoading = true;
    });
  }
  
  $scope.path = $route.current.path;
  $scope.menus = [{
    title: 'Graphs',
    icon: 'stats',
    href: '#/blockchain/graphs'
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
