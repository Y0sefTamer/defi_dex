// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
/*
    @title Exchange Contract
    @author YosefTamer
    @dev This contract implements a decentralized exchange (DEX) for trading a specific ERC20 token with ETH.
    It allows users to add/remove liquidity, swap ETH for tokens, and swap tokens for ETH.
*/
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

    ////////////////////////////////////////
    ////// External Functions //////
    ///////////////////////////////////////
    /*
        @dev Returns the address of the ERC20 token associated with this exchange.
        @return The address of the ERC20 token.
        */
    function addLiquidity(uint256 tokensAdded) external payable nonReentrant returns (uint256) {
        require(msg.value > 0 && tokensAdded > 0, "Invalid values provided");

        uint256 ethBalance = address(this).balance;
        uint256 tokenBalance = getTokenReserves();

        if (tokenBalance == 0) {
            require(IERC20(tokenAddress).balanceOf(msg.sender) >= tokensAdded, "Insufficient token balance");
            IERC20(tokenAddress).transferFrom(msg.sender, address(this), tokensAdded);
            uint256 liquidity = ethBalance;
            _mint(msg.sender, liquidity);
            emit LiquidityAdded(msg.sender, msg.value, tokensAdded);
            return liquidity;
        } else {
            uint256 liquidity = (msg.value * totalSupply()) / (ethBalance - msg.value);
            require(IERC20(tokenAddress).balanceOf(msg.sender) >= tokensAdded, "Insufficient token balance");
            IERC20(tokenAddress).transferFrom(msg.sender, address(this), tokensAdded);
            _mint(msg.sender, liquidity);
            emit LiquidityAdded(msg.sender, msg.value, tokensAdded);
            return liquidity;
        }
    }
    /*
        @dev Removes liquidity from the exchange and returns the corresponding ETH and token amounts to the liquidity provider.
        @param tokenAmount The amount of liquidity tokens to burn.
        @return ethAmount The amount of ETH returned to the liquidity provider.
        @return tokenAmt The amount of ERC20 tokens returned to the liquidity provider.
        */

    function removeLiquidity(uint256 tokenAmount) external nonReentrant returns (uint256, uint256) {
        require(tokenAmount > 0, "Invalid token amount");

        uint256 ethAmount = (address(this).balance * tokenAmount) / totalSupply();
        uint256 tokenAmt = (getTokenReserves() * tokenAmount) / totalSupply();

        require(
            (getTokenReserves() / address(this).balance)
                == ((getTokenReserves() + tokenAmt) / (address(this).balance + ethAmount)),
            "Invariant check failed"
        );
        _burn(msg.sender, tokenAmount);

        payable(msg.sender).transfer(ethAmount);
        IERC20(tokenAddress).transfer(msg.sender, tokenAmt);

        emit LiquidityRemoved(msg.sender, ethAmount, tokenAmt);

        return (ethAmount, tokenAmt);
    }

    /*
            @dev Swaps ETH for the associated ERC20 tokens.
            @param minTokens The minimum amount of tokens expected to receive.
            @param recipient The address that will receive the purchased tokens.
            @return The amount of tokens purchased.
            */
    function swapEthForTokens(uint256 minTokens, address recipient) external payable nonReentrant returns (uint256) {
        uint256 tokenAmount = getTokenAmount(msg.value);
        require(tokenAmount >= minTokens, "Token amount less than expected");

        IERC20(tokenAddress).transfer(recipient, tokenAmount);
        emit TokenPurchased(msg.sender, msg.value, tokenAmount);

        return tokenAmount;
    }

    /*
            @dev Swaps the associated ERC20 tokens for ETH.
            @param tokensSold The amount of tokens to sell.
            @param minEth The minimum amount of ETH expected to receive.
            @return The amount of ETH received.
            */
    function tokenForEthSwap(uint256 tokensSold, uint256 minEth) external nonReentrant returns (uint256) {
        uint256 ethAmount = getEthAmount(tokensSold);
        require(ethAmount >= minEth, "ETH amount less than expected");

        IERC20(tokenAddress).transferFrom(msg.sender, address(this), tokensSold);
        payable(msg.sender).transfer(ethAmount);
        emit TokenSold(msg.sender, tokensSold, ethAmount);

        return ethAmount;
    }

    ////////////////////////////////////////
    ////// View Functions //////
    ///////////////////////////////////////
    /*
        @dev Returns the amount of ERC20 tokens held by the exchange contract.
        @return The amount of ERC20 tokens in the exchange contract.
        */
    function getTokenReserves() public view returns (uint256) {
        return IERC20(tokenAddress).balanceOf(address(this));
    }

    /*
        @dev Returns the amount of ERC20 tokens that can be purchased with the given amount of ETH.
        @param ethSold The amount of ETH to be sold.
        @return The amount of ERC20 tokens that can be purchased.
        */
    function getTokenAmount(uint256 ethSold) public view returns (uint256) {
        require(ethSold > 0, "ETH sold must be greater than 0");
        uint256 outputReserve = getTokenReserves();
        return getAmount(ethSold, address(this).balance - ethSold, outputReserve);
    }

    /*
        @dev Returns the amount of ETH that can be purchased with the given amount of ERC20 tokens.
        @param tokensSold The amount of ERC20 tokens to be sold.
        @return The amount of ETH that can be purchased.
        */
    function getEthAmount(uint256 tokensSold) public view returns (uint256) {
        require(tokensSold > 0, "Tokens sold must be greater than 0");
        uint256 inputReserve = getTokenReserves();
        return getAmount(tokensSold, inputReserve - tokensSold, address(this).balance);
    }

    /*
        @dev Calculates the output amount of tokens based on the input amount and reserves.
        @param inputAmount The amount of input tokens.
        @param inputReserve The reserve of input tokens in the exchange.
        @param outputReserve The reserve of output tokens in the exchange.
        @return The calculated output amount of tokens.
        */
    function getAmount(uint256 inputAmount, uint256 inputReserve, uint256 outputReserve) public pure returns (uint256) {
        require(inputReserve > 0 && inputAmount > 0, "Invalid values provided");
        uint256 inputAmountWithFee = inputAmount * 997; // Applying a 0.3% fee
        uint256 numerator = inputAmountWithFee * outputReserve;
        uint256 denominator = (inputReserve * 1000) + inputAmountWithFee;
        return numerator / denominator;
    }
}
