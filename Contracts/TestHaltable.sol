// (c) 2017 Pridecoin Project. The MIT License

pragma solidity ^0.4.13; 

import "./Haltable.sol";

contract TestHaltable is Haltable {
	bool public test;

	function allowedWhenNotHalted() stopInEmergency returns(bool) {
		return true;
	} 

	function allowedInEmergency() onlyInEmergency returns(bool) {
		return true;
	}

	function nothing() returns(bool) {
		return true;
	}
}
