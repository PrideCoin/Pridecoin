// (c) 2017 Pridecoin Project. The MIT License

pragma solidity ^0.4.13; 
import "./Ownable.sol";
import "./Haltable.sol";
import "./StandardToken.sol";
import "./Token.sol";

/*
 * @title XPR (PRIDE) token
 *
 * Implements ERC 20 Token standard: https://github.com/ethereum/EIPs/issues/20 with the addition 
 * of ownership, a lock and issuing.
 *
 * #created 05/03/2017
 * #author Frank Bonnet
 */
contract PrideToken is Ownable, Haltable, StandardToken {

    // Ethereum token standaard
    string public standard = "PrideCoin 0.1";

    // Full name
    string public name = "PRIDE";        
    
    // Symbol
    string public symbol = "XPR";

    // No decimal points
    uint8 public decimals = 8;


    /*
     * Starts with a total supply of zero and the creator starts with 
     * zero tokens (just like everyone else)
     */
    function PrideToken() {  
        balances[msg.sender] = 0;
        totalSupply = 0;
        locked = true;
    }


    /*
     * Unlocks the token irreversibly so that the transfering of value is enabled 
     *
     * @return Whether the unlocking was successful or not
     */
    function unlock() onlyOwner returns (bool success)  {
        locked = false;
        return true;
    }

    /*
     * Issues `_value` new tokens to `_recipient` (_value < 0 guarantees that tokens are never removed)
     *
     * @param _recipient The address to which the tokens will be issued
     * @param _value The amount of new tokens to issue
     * @return Whether the approval was successful or not
     */
    function issue(address _recipient, uint256 _value) onlyOwner returns (bool success) {

        // Guarantee positive 
        require (_value >= 0); 

        // Create tokens
        balances[_recipient] += _value;
        totalSupply += _value;

        // Notify listners
        Transfer(0, owner, _value);
        Transfer(owner, _recipient, _value);

        return true;
    }

	function decimals() constant returns (uint8 decimals) {
		return decimals;
	}

	function getOwner() constant returns(address) {
		return owner;
	}

    /*
     * Prevents accidental sending of ether
     */
    function () {
        throw;
    }
}  
