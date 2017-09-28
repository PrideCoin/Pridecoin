//var ConvertLib = artifacts.require("./ConvertLib.sol");
var Ownable = artifacts.require("./Ownable.sol");
var TestOwnable = artifacts.require("./TestOwnable.sol");
var TestHaltable = artifacts.require("./TestHaltable.sol");
var PrideToken = artifacts.require("./PrideToken.sol");
var PrideTokenForCrowdsale = artifacts.require("./PrideToken.sol"); // another instance of the pridecoin token used for crowdsale testing
var PrideCoinCrowdsale = artifacts.require("./PrideCoinCrowdsale.sol");

module.exports = function(deployer) {
//  deployer.deploy(ConvertLib);
//  deployer.link(ConvertLib, MetaCoin);
//  deployer.deploy(MetaCoin);
	deployer.deploy(Ownable);
	deployer.deploy(TestOwnable);
	deployer.deploy(TestHaltable);
	deployer.deploy(PrideToken);
	deployer.deploy(PrideTokenForCrowdsale).then(function() {
		var daysecs = 60 * 60 * 24; // number of seconds of a day
		return deployer.deploy(PrideCoinCrowdsale, PrideTokenForCrowdsale.address, (new Date().getTime() / 1000) + daysecs, 22 * daysecs);
	});
	
/*	var daymilisecs = 1000 * 60 * 60 * 24; // nr of miliseconds of a day

	deployer.deploy(PrideCoinCrowdsale, deployer.deploy(PrideToken), new Date().getTime() + daymilisecs, 15 * daymilisecs); */
};
