// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./Exchange.sol";

/*
    @title Factory Contract
    @author YosefTamer
    @dev This contract is responsible for creating new Exchange contracts for different ERC20 tokens.
    It maintains mappings to keep track of the created exchanges and their associated tokens.
*/
contract Factory {
    ////////////////////////////////////////
    ////// Custom Errors //////
    ///////////////////////////////////////
    error Factory_ExchangeAlreadyExists();
    error Factory_InvalidTokenAddress();

    ////////////////////////////////////////
    ////// STate Variables & Mappings //////
    ///////////////////////////////////////
    uint256 public tokenCount;
    mapping(address => address) public tokenToExchange;
    mapping(address => address) public exchangeToToken;
    mapping(uint256 => address) public idToToken;
    Exchange[] public exchangeArray;

    event ExchangeCreated(address indexed tokenAddress, address indexed exchangeAddress);

    /*
        @dev Creates a new Exchange contract for the given ERC20 token address.
        @param _tokenAddress The address of the ERC20 token for which the exchange is to be created.
        @return The address of the newly created Exchange contract.
        */
    function createNewExchange(address _tokenAddress) public returns (address) {
        if (_tokenAddress == address(0)) {
            revert Factory_InvalidTokenAddress();
        }
        if (tokenToExchange[_tokenAddress] != address(0)) {
            revert Factory_ExchangeAlreadyExists();
        }
        Exchange exchange = new Exchange(_tokenAddress);
        exchangeArray.push(exchange);
        tokenToExchange[_tokenAddress] = address(exchange);
        exchangeToToken[address(exchange)] = _tokenAddress;
        tokenCount++;
        idToToken[tokenCount] = _tokenAddress;
        emit ExchangeCreated(_tokenAddress, address(exchange));
        return address(exchange);
    }

    /*
        @dev Returns the address of the Exchange contract associated with the given ERC20 token address.
        @param _tokenAddress The address of the ERC20 token.
        @return The address of the associated Exchange contract.
        */
    function getExchange(address _tokenAddress) public view returns (address) {
        return tokenToExchange[_tokenAddress];
    }

    /*
    @dev Returns the address of the ERC20 token associated with the given Exchange contract address.
    @param _exchange The address of the Exchange contract.
    @return The address of the associated ERC20 token.
    */
    function getToken(address _exchange) public view returns (address) {
        return exchangeToToken[_exchange];
    }

    /*
    @dev Returns the address of the ERC20 token associated with the given token ID.
    @param _tokenId The ID of the token.
    @return The address of the associated ERC20 token.
    */
    function getTokenWithId(uint256 _tokenId) public view returns (address) {
        return idToToken[_tokenId];
    }
}
