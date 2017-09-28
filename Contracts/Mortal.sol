pragma solidity ^0.4.11; 

// (c) 2017 Pridecoin Project. The MIT License

// Allows the creator to remove the stop the functioning of the contract
contract Mortal is Ownable {
    function kill() onlyOwner {
        selfdestruct(owner);
    }
} 
