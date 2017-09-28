// (c) 2017 Pridecoin Project. The MIT License

pragma solidity ^0.4.13; 

import "./Ownable.sol";

// Allows the creator to remove the stop the functioning of the contract
contract Mortal is Ownable {
    function kill() onlyOwner {
        selfdestruct(owner);
    }
} 
