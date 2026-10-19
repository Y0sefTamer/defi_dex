// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./Exchange.sol";

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

    function getExchange(address _tokenAddress) public view returns (address) {
        return tokenToExchange[_tokenAddress];
    }

    function getToken(address _exchange) public view returns (address) {
        return exchangeToToken[_exchange];
    }

    function getTokenWithId(uint256 _tokenId) public view returns (address) {
        return idToToken[_tokenId];
    }
}
