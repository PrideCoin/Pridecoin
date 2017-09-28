// (c) 2017 Pridecoin Project. The MIT License

pragma solidity ^0.4.13; 

import "./Ownable.sol";

// used for testing the ownable contract
contract TestOwnable is Ownable {
	function testOnlyOwner() onlyOwner returns (bool) {
		return true; // should return true only to owner
	}
}
