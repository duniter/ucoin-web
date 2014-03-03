
module.exports = new ContractCache();

function ContractCache () {
	
	var amendments = [];
	var mapIndex = {};

	/**
	* Push an amendment in amendments stack.
	*/
	this.push = function (am) {
		amendments.push(am);
		mapIndex[am.number] = amendments.length - 1;
	};

	this.amendments = function () {
		return amendments;
	};

	this.getNumber = function (number) {
		return (mapIndex[number] != undefined && amendments[mapIndex[number]]) || null;
	};
}