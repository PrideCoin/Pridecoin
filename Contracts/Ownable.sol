// (c) 2017 Pridecoin Project. The MIT License
pragma solidity ^0.4.13; 

contract Ownable {

    // The address of the account that is the current owner 
    address public owner;

    // The publiser is the inital owner
    function Ownable() {
        owner = msg.sender;
    }

    
    //Access is restricted to the current owner
    modifier onlyOwner() {
        require (msg.sender == owner);
        _;
    }

  
    //Transfer ownership to `_newOwner`
    function transferOwnership(address _newOwner) onlyOwner {
        owner = _newOwner;
    }
} 
