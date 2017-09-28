pragma solidity ^0.4.13;

import "./ERC20.sol";

/*
 * Implements ERC 20 Token standard: https://github.com/ethereum/EIPs/issues/20
 *
 * Modified version of https://github.com/ConsenSys/Tokens that implements the 
 * original Token contract, an abstract contract for the full ERC 20 Token standard
 */
contract StandardToken is ERC20 {

    // Token starts if the locked state restricting transfers
    bool public locked;

    // token balances
    mapping (address => uint256) balances;

    // token allowances
    mapping (address => mapping (address => uint256)) allowed;
    

    /* 
     * Get balance of `_owner` 
     * 
     * @param _owner The address from which the balance will be retrieved
     * @return The balance
     */
    function balanceOf(address _owner) constant returns (uint256 balance) {
        return balances[_owner];
    }


    /*
     * Send `_value` token to `_to` from `msg.sender`
     * 
     * @param _to The address of the recipient
     * @param _value The amount of token to be transferred
     * @return Whether the transfer was successful or not
     */
    function transfer(address _to, uint256 _value) returns (bool success) {

        // Unable to transfer while still locked
        require(!locked);

        // Check if the sender has enough tokens
        require(balances[msg.sender] >= _value) ;

        // Check for overflows
        require (balances[_to] + _value >= balances[_to]);

        // Transfer tokens
        balances[msg.sender] -= _value;
        balances[_to] += _value;

        // Notify listners
        Transfer(msg.sender, _to, _value);
        return true;
    }


    /*
     * Send `_value` token to `_to` from `_from` on the condition it is approved by `_from`
     * 
     * @param _from The address of the sender
     * @param _to The address of the recipient
     * @param _value The amount of token to be transferred
     * @return Whether the transfer was successful or not
     */
    function transferFrom(address _from, address _to, uint256 _value) returns (bool success) {

         // Unable to transfer while still locked
        require (!locked);

        // Check if the sender has enough
        require (balances[_from] >= _value);

        // Check for overflows
        require (balances[_to] + _value >= balances[_to]);

        // Check allowance
        require (_value <= allowed[_from][msg.sender]);

        // Transfer tokens
        balances[_to] += _value;
        balances[_from] -= _value;

        // Update allowance
        allowed[_from][msg.sender] -= _value;

        // Notify listners
        Transfer(_from, _to, _value);
        return true;
    }


    /*
     * `msg.sender` approves `_spender` to spend `_value` tokens
     * 
     * @param _spender The address of the account able to transfer the tokens
     * @param _value The amount of tokens to be approved for transfer
     * @return Whether the approval was successful or not
     */
    function approve(address _spender, uint256 _value) returns (bool success) {

        // Unable to approve while still locked
        require (!locked);

        // Update allowance
        allowed[msg.sender][_spender] = _value;

        // Notify listners
        Approval(msg.sender, _spender, _value);
        return true;
    }


    /*
     * Get the amount of remaining tokens that `_spender` is allowed to spend from `_owner`
     * 
     * @param _owner The address of the account owning tokens
     * @param _spender The address of the account able to transfer the tokens
     * @return Amount of remaining tokens allowed to spent
     */
    function allowance(address _owner, address _spender) constant returns (uint256 remaining) {
      return allowed[_owner][_spender];
    }
    
}
 
