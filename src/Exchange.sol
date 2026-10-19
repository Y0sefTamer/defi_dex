// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Exchange is ERC20, ReentrancyGuard {
    ////////////////////////////////////////
    ////// STate Variables & Mappings //////
    ///////////////////////////////////////
    address immutable tokenAddress; // The address of the ERC20 token (being traded)
    address immutable factoryAddress; // The interface for the factory contract

    ////////////////////////////////////////
    ////// Events //////
    ///////////////////////////////////////
    event LiquidityAdded(address indexed provider, uint256 ethAmount, uint256 tokenAmount); // Emitted when liquidity is added
    event LiquidityRemoved(address indexed provider, uint256 ethAmount, uint256 tokenAmount); // Emitted when liquidity is removed
    event TokenPurchased(address indexed buyer, uint256 ethAmount, uint256 tokensReceived); // Emitted when a token (ERC-20) is purchased with ETH
    event TokenSold(address indexed seller, uint256 tokensSold, uint256 ethReceived); // Emitted when ETH is purchased with a token
    ////////////////////////////////////////
    ////// Constructor //////
    ///////////////////////////////////////
    /*
        @dev Constructor for the Exchange contract.
        @param _tokenAddress The address of the ERC20 token for which this exchange is created.
        */
    constructor(address _tokenAddress) ERC20("UNI-V1", "UNI-V1") {
        require(_tokenAddress != address(0), "Token address cannot be 0x0");
        tokenAddress = _tokenAddress;
        factoryAddress = msg.sender;
    }
}
