
module.exports = new ContractCache();

function ContractCache () {
  
  var amendments = [];
  var mapIndex = {};
	var monetaryMass = 0;
	var lastUD = {};
	var highestAM = 0;
  var that = this;

  /**
  * Push an amendment in amendments stack.
  */
  this.push = function (am) {
		if (mapIndex[am.number] == undefined || mapIndex[am.number] == null) {
			amendments.push(am);
			mapIndex[am.number] = amendments.length - 1;
			if (am.number >= highestAM && am.dividend) {
				highestAM = am.number;
			}
			if (am.number == highestAM && am.dividend) {
				lastUD = {
					dividend: am.dividend,
					members: am.membersCount
				};
			}
			if (am.dividend) {
				monetaryMass += am.dividend * am.membersCount;
			}
		}
  };

  this.amendments = function () {
    return amendments;
  };

  this.getNumber = function (number) {
    return (mapIndex[number] != undefined && amendments[mapIndex[number]]) || null;
  };

	this.lastDividend = function () {
		return lastUD.dividend;
	};

	this.lastDividendMembersCount = function () {
		return lastUD.members;
	};

	this.monetaryMass = function () {
		return monetaryMass;
	};

  this.getStack = function (am, node, done) {

    this.push(am);

    // Calling from start amendment
    getPrevious(am, [am], done);

    // Getting all previous in cascade
    function getPrevious (am, stack, done) {
      var previous = that.getNumber(am.number - 1);
      if (previous) {
        // Use cached version
        stack.push(previous);
        if(previous.number > 0)
          getPrevious(previous, stack, done);
        else
          done(null, stack);
      } else {
        // Get remote version and cache it
        node.hdc.amendments.view.self(am.number-1, am.previousHash, function (err, previous) {
          if(previous){
            stack.push(previous);
            that.push(previous);
            if(previous.number > 0)
              getPrevious(previous, stack, done);
            else
              done(null, stack);
          }
          else done(null, stack);
        });
      }
    }
  };
}