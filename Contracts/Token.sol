// (c) 2017 Pridecoin Project. The MIT License
pragma solidity ^0.4.13;

contract Token { 
    function issue(address _recipient, uint256 _value) returns (bool success) {} 
    function totalSupply() constant returns (uint256 supply) {}
    function unlock() returns (bool success) {}
	function decimals() constant returns (uint8 decimals) {}
	function transferOwnership(address _newOwner) {}
	function getOwner() constant returns(address) { }
}
