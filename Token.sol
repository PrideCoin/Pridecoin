pragma solidity ^0.4.11;

// (c) 2017 Pridecoin Project. The MIT License

contract Token { 
    function issue(address _recipient, uint256 _value) returns (bool success) {} 
    function totalSupply() constant returns (uint256 supply) {}
    function unlock() returns (bool success) {}
} 
