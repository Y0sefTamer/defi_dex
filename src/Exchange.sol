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
}
