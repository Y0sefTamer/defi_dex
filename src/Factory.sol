// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./Exchange.sol";

contract Factory {
    mapping(address => address) public tokenToExchange;
    mapping(address => address) public exchangeToToken;
    mapping(uint256 => address) public idToToken;
    Exchange[] public exchangeArray;

    event ExchangeCreated(address indexed tokenAddress, address indexed exchangeAddress);
}
