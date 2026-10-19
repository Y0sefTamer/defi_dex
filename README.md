# Uniswap V1 Practice DEX

> [!WARNING]
> **Educational project — not production ready.**
>
> This repository is a practice implementation of the Uniswap V1 automated market maker (AMM) model, built to learn how constant-product exchanges, liquidity tokens, and factory-based pool creation work.
>
> It has **not been audited**. Do not deploy it to mainnet or use it with real funds.

![Solidity](https://img.shields.io/badge/Solidity-0.8.13-363636?logo=solidity)
![Foundry](https://img.shields.io/badge/Built%20with-Foundry-000000)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Contracts](#contracts)
- [How the AMM Works](#how-the-amm-works)
- [Repository Structure](#repository-structure)
- [Requirements](#requirements)
- [Quick Start](#quick-start)
- [Testing](#testing)
- [Deployment](#deployment)
- [Deployment Best Practices](#deployment-best-practices)
- [Using the DEX](#using-the-dex)
- [Deployment Records](#deployment-records)
- [Known Limitations](#known-limitations)
- [Security Notes](#security-notes)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Author](#author)

---

## Overview

This project is a minimal Uniswap V1-style decentralized exchange built with Solidity and Foundry.

It implements:

- Permissionless exchange creation through a `Factory`
- One `ERC20 / ETH` pool per token
- Constant-product pricing with a **0.3% swap fee**
- ERC20-based liquidity provider (LP) tokens
- Add and remove liquidity
- ETH-to-token and token-to-ETH swaps
- Minimum output protection for swaps
- Reentrancy protection
- Custom errors and events

The goal is educational: understand the mechanics and tradeoffs of Uniswap V1 in a small, readable codebase.

---

## Architecture

```text
                         createNewExchange(token)
        ┌─────────────┐ ───────────────────────────▶ ┌───────────────┐
        │   Factory   │                              │   Exchange    │
        │             │ ◀── tokenToExchange ──────── │  (AMM + LP)   │
        │             │     exchangeToToken          │               │
        └─────────────┘                              └───────┬───────┘
                                                             │ holds
                                                   ┌─────────┴─────────┐
                                                   │    ERC20 token     │
                                                   │   (e.g. MyToken)   │
                                                   └───────────────────┘
```

The `Factory` creates one `Exchange` per ERC20 token and records the relationship in both directions. The `Exchange` holds the token reserve, the ETH reserve, and mints LP tokens to liquidity providers.

---

## Contracts

| Contract | Path | Description |
|---|---|---|
| `Factory` | [`src/Factory.sol`](src/Factory.sol) | Creates and indexes one exchange per ERC20 token |
| `Exchange` | [`src/Exchange.sol`](src/Exchange.sol) | AMM, ETH/token swaps, liquidity management, LP token |
| `MyToken` | [`src/ERC20.sol`](src/ERC20.sol) | Demo ERC20 (`MyToken` / `MTK`) with owner-restricted minting |

### Factory

- `createNewExchange(address token)`
- `getExchange(address token)`
- `getToken(address exchange)`
- `getTokenWithId(uint256 tokenId)`
- Public mappings: `tokenToExchange`, `exchangeToToken`, `idToToken`
- Public state: `tokenCount`, `exchangeArray`

`idToToken` is 1-indexed, while `exchangeArray` is 0-indexed.

### Exchange

- `addLiquidity(uint256 tokensAdded) payable`
- `removeLiquidity(uint256 tokenAmount)`
- `swapEthForTokens(uint256 minTokens, address recipient) payable`
- `tokenForEthSwap(uint256 tokensSold, uint256 minEth)`
- `getTokenReserves()`
- `getTokenAmount(uint256 ethSold)`
- `getEthAmount(uint256 tokensSold)`
- `getAmount(uint256 inputAmount, uint256 inputReserve, uint256 outputReserve)`

The exchange itself is an ERC20 named `UNI-V1`, which represents liquidity provider shares. `tokenAddress` and `factoryAddress` are immutable.

### MyToken

- ERC20 name: `MyToken`
- Symbol: `MTK`
- Decimals: `18`
- Initial supply: `10,000 MTK` minted to the deployer
- Owner can mint additional tokens

> `MyToken` is a demo asset. It is not intended for production use.

---

## How the AMM Works

### Constant product

The exchange maintains two reserves:

- `x` = ETH reserve
- `y` = token reserve

The invariant is:

```text
x * y = k
```

### Swap fee and output amount

A 0.3% fee is applied to the input amount:

```text
amountInWithFee = amountIn * 997
amountOut = (amountInWithFee * reserveOut) / (reserveIn * 1000 + amountInWithFee)
```

The fee remains in the reserves and accrues to liquidity providers over time.

### Liquidity tokens

For the first liquidity deposit:

```text
liquidity = ETH deposited
```

For subsequent deposits:

```text
liquidity = (ETH deposited * totalSupply) / ETH reserve before deposit
```

### Removing liquidity

LP tokens are redeemed pro rata:

```text
ethOut   = ETH reserve   * LP amount / totalSupply
tokenOut = token reserve * LP amount / totalSupply
```

### Important pricing note

The first liquidity provider sets the initial price by choosing how many tokens to pair with the deposited ETH. The contract does **not** calculate or enforce the correct token amount for subsequent deposits. Always compute the required token amount from the current reserves before calling `addLiquidity`.

---

## Repository Structure

```text
.
├── src/
│   ├── ERC20.sol          # MyToken demo ERC20
│   ├── Exchange.sol       # AMM + LP token
│   └── Factory.sol        # Exchange factory and registry
├── test/
│   ├── Exchange.t.sol     # Liquidity and swap tests
│   └── Factory.t.sol      # Exchange creation tests
├── .github/
│   └── workflows/
│       └── test.yml       # CI: fmt, build, test
├── foundry.toml
├── remappings.txt
├── foundry.lock
└── lib/
    ├── forge-std/
    └── openzeppelin-contracts/
```

Dependencies:

- [Foundry](https://book.getfoundry.sh/)
- [OpenZeppelin Contracts v5.7.0](https://github.com/OpenZeppelin/openzeppelin-contracts)
- [forge-std v1.17.0](https://github.com/foundry-rs/forge-std)

---

## Requirements

- Git
- Foundry (`forge`, `cast`, `anvil`)
- Optional: a Sepolia RPC endpoint and an Etherscan API key

Check your Foundry installation:

```bash
forge --version
cast --version
anvil --version
```

The project was tested with Foundry `1.5.1-stable`.

---

## Quick Start

Clone the repository with submodules:

```bash
git clone --recurse-submodules <REPOSITORY_URL>
cd defi_DEX
```

If you already cloned without submodules:

```bash
git submodule update --init --recursive
```

Build:

```bash
forge build
```

Run the tests:

```bash
forge test -vvv
```

Format and lint:

```bash
forge fmt --check
forge lint
```

Check contract sizes:

```bash
forge build --sizes
```

---

## Testing

The test suite covers:

- Creating an exchange through the factory
- Reverting when an exchange already exists for a token
- Adding liquidity
- Removing liquidity
- Swapping ETH for tokens
- Swapping tokens for ETH

Run all tests:

```bash
forge test -vvv
```

Run only exchange tests:

```bash
forge test --match-contract ExchangeTest -vvvv
```

Run a specific test:

```bash
forge test --match-test testSwapEthForTokens -vvvv
```

Use `-vvvv` when you need full execution traces.

---

## Deployment

> [!NOTE]
> This project is intended for local Anvil and public testnets such as Sepolia. Do not deploy it to mainnet.

### Deployment sequence

1. Deploy `Factory`.
2. Deploy the token, or use an existing ERC20.
3. Call `Factory.createNewExchange(token)`.
4. Verify the Factory, token, and Exchange.
5. Record the deployed addresses.
6. Add initial liquidity immediately.

Always create exchanges through the `Factory`. Deploying an `Exchange` directly bypasses the factory registry and makes the pool undiscoverable through the Factory.

---

## Deployment Best Practices

### 1. Start locally

Rehearse the full deployment on Anvil before using a testnet.

```bash
anvil
```

In another terminal:

```bash
export LOCAL_RPC_URL=http://127.0.0.1:8545
export ANVIL_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
export INITIAL_OWNER=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

forge create src/Factory.sol:Factory \
  --rpc-url "$LOCAL_RPC_URL" \
  --private-key "$ANVIL_KEY" \
  --broadcast

forge create src/ERC20.sol:MyToken \
  --constructor-args "$INITIAL_OWNER" \
  --rpc-url "$LOCAL_RPC_URL" \
  --private-key "$ANVIL_KEY" \
  --broadcast
```

Then create the exchange:

```bash
export FACTORY=<factory address from output>
export TOKEN=<token address from output>

cast send "$FACTORY" "createNewExchange(address)" "$TOKEN" \
  --rpc-url "$LOCAL_RPC_URL" \
  --private-key "$ANVIL_KEY"
```

The Anvil private key above is publicly known. Use it only on a local chain.

### 2. Use secure key management

Do not store private keys in `.env`, source files, or shell history.

For testnets, use an encrypted Foundry keystore:

```bash
cast wallet import deployer --interactive
cast wallet list
cast wallet address --account deployer
```

Then deploy with:

```bash
forge create ... --account deployer
```

For deployments involving real value, use a hardware wallet:

```bash
forge create ... --ledger
```

Recommended key sources:

| Environment | Key source |
|---|---|
| Local Anvil | Anvil default key (publicly known) |
| Testnet | Encrypted Foundry keystore |
| Mainnet | Hardware wallet or multisig |

### 3. Use a dedicated deployer

Create a deployer account specifically for this project. Do not reuse a personal wallet or an account that holds unrelated assets.

### 4. Pin compiler and optimizer settings

Before deploying, pin the compiler version and optimizer settings in `foundry.toml`:

```toml
solc = "0.8.20"
optimizer = true
optimizer_runs = 200
```

Verification must use the same compiler version and optimizer settings as deployment. Mismatched settings are the most common cause of verification failures.

### 5. Simulate and inspect before broadcasting

For Foundry scripts, run the script without `--broadcast` first and inspect the trace:

```bash
forge script <SCRIPT> -vvvv
```

For `forge create` and `cast`, rehearse on Anvil or an Anvil fork of the target network first:

```bash
anvil --fork-url "$SEPOLIA_RPC_URL"
```

### 6. Use `--slow` when deploying sequences

If you use a Foundry deployment script that creates the Factory and then calls `createNewExchange`, use `--slow` so each transaction is confirmed before the next one is sent:

```bash
forge script <SCRIPT> --broadcast --slow
```

If a broadcast is interrupted, resume it with:

```bash
forge script <SCRIPT> --resume
```

### 7. Deploy to Sepolia

Set your environment:

```bash
export SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/...
export ETHERSCAN_API_KEY=...
export INITIAL_OWNER=0x...
```

Deploy the Factory:

```bash
forge create src/Factory.sol:Factory \
  --rpc-url "$SEPOLIA_RPC_URL" \
  --account deployer \
  --broadcast \
  --verify \
  --verifier etherscan \
  --etherscan-api-key "$ETHERSCAN_API_KEY"
```

Deploy the demo token:

```bash
forge create src/ERC20.sol:MyToken \
  --constructor-args "$INITIAL_OWNER" \
  --rpc-url "$SEPOLIA_RPC_URL" \
  --account deployer \
  --broadcast \
  --verify \
  --verifier etherscan \
  --etherscan-api-key "$ETHERSCAN_API_KEY"
```

Create the exchange:

```bash
export FACTORY=<factory address>
export TOKEN=<token address>

cast send "$FACTORY" "createNewExchange(address)" "$TOKEN" \
  --rpc-url "$SEPOLIA_RPC_URL" \
  --account deployer

export EXCHANGE=$(cast call "$FACTORY" "getExchange(address)(address)" "$TOKEN" \
  --rpc-url "$SEPOLIA_RPC_URL")
```

Verify the exchange. The `Exchange` constructor takes the token address:

```bash
forge verify-contract "$EXCHANGE" src/Exchange.sol:Exchange \
  --chain sepolia \
  --constructor-args "$(cast abi-encode "constructor(address)" "$TOKEN")" \
  --verifier etherscan \
  --etherscan-api-key "$ETHERSCAN_API_KEY"
```

### 8. Record deployed addresses

Save the Factory, token, and Exchange addresses for each chain. See [Deployment Records](#deployment-records).

### 9. Add liquidity immediately

The first liquidity provider sets the price. Do not leave a newly created exchange empty for long. Decide the initial ETH/token ratio deliberately and add liquidity as the next operational step.

### 10. Hand off ownership if needed

`MyToken` uses OpenZeppelin `Ownable`. If the token has value or a community, transfer ownership to a multisig or a dedicated owner:

```bash
cast send "$TOKEN" "transferOwnership(address)" "$NEW_OWNER" \
  --rpc-url "$SEPOLIA_RPC_URL" \
  --account deployer
```

Note that the initial `10,000 MTK` supply is minted to the deployer, not to `INITIAL_OWNER`. If those differ, transfer the initial supply separately.

---

## Using the DEX

Set the addresses and RPC endpoint:

```bash
export RPC_URL=$SEPOLIA_RPC_URL
export FACTORY=<factory address>
export TOKEN=<token address>
export EXCHANGE=<exchange address>
export ACCOUNT=deployer
```

### Read factory data

```bash
cast call "$FACTORY" "getExchange(address)(address)" "$TOKEN" --rpc-url "$RPC_URL"
cast call "$FACTORY" "getToken(address)(address)" "$EXCHANGE" --rpc-url "$RPC_URL"
cast call "$FACTORY" "tokenCount()(uint256)" --rpc-url "$RPC_URL"
```

### Approve tokens

Liquidity and token-to-ETH swaps require an allowance:

```bash
cast send "$TOKEN" "approve(address,uint256)" "$EXCHANGE" "$TOKEN_AMOUNT_WEI" \
  --rpc-url "$RPC_URL" \
  --account "$ACCOUNT"
```

Check the allowance:

```bash
cast call "$TOKEN" "allowance(address,address)(uint256)" \
  "$(cast wallet address --account "$ACCOUNT")" "$EXCHANGE" \
  --rpc-url "$RPC_URL"
```

### Add liquidity

First deposit example: `10 ETH` and `10,000 MTK`.

```bash
export ETH_AMOUNT=$(cast to-wei 10 ether)
export TOKEN_AMOUNT=$(cast to-wei 10000 ether)

cast send "$TOKEN" "approve(address,uint256)" "$EXCHANGE" "$TOKEN_AMOUNT" \
  --rpc-url "$RPC_URL" \
  --account "$ACCOUNT"

cast send "$EXCHANGE" "addLiquidity(uint256)" "$TOKEN_AMOUNT" \
  --value "$ETH_AMOUNT" \
  --rpc-url "$RPC_URL" \
  --account "$ACCOUNT"
```

For subsequent deposits, compute the token amount from the current ratio:

```text
tokensRequired = ETH deposited * token reserve / ETH reserve
```

```bash
ETH_RESERVE=$(cast balance "$EXCHANGE" --rpc-url "$RPC_URL")
TOKEN_RESERVE=$(cast call "$EXCHANGE" "getTokenReserves()(uint256)" --rpc-url "$RPC_URL")
TOKENS_REQUIRED=$((ETH_AMOUNT * TOKEN_RESERVE / ETH_RESERVE))
```

The contract does not verify this ratio. Depositing at a different ratio changes the price and can transfer value between LPs.

### Get a quote

Use the pure `getAmount` helper with the current reserves:

```bash
ETH_RESERVE=$(cast balance "$EXCHANGE" --rpc-url "$RPC_URL")
TOKEN_RESERVE=$(cast call "$EXCHANGE" "getTokenReserves()(uint256)" --rpc-url "$RPC_URL")

cast call "$EXCHANGE" "getAmount(uint256,uint256,uint256)(uint256)" \
  "$ETH_IN_WEI" "$ETH_RESERVE" "$TOKEN_RESERVE" \
  --rpc-url "$RPC_URL"
```

> The public `getTokenAmount` and `getEthAmount` helpers assume the input asset has already been received by the exchange, as it is during a swap. They are not reliable standalone pre-trade quotes. Use `getAmount` with current reserves for off-chain quoting.

### Swap ETH for tokens

```bash
cast send "$EXCHANGE" "swapEthForTokens(uint256,address)" "$MIN_TOKENS" "$RECIPIENT" \
  --value "$ETH_IN_WEI" \
  --rpc-url "$RPC_URL" \
  --account "$ACCOUNT"
```

`minTokens` protects against slippage. Set it from your quote with an acceptable tolerance.

### Swap tokens for ETH

Approve the exchange first, then swap:

```bash
cast send "$TOKEN" "approve(address,uint256)" "$EXCHANGE" "$TOKENS_IN_WEI" \
  --rpc-url "$RPC_URL" \
  --account "$ACCOUNT"

cast send "$EXCHANGE" "tokenForEthSwap(uint256,uint256)" "$TOKENS_IN_WEI" "$MIN_ETH_WEI" \
  --rpc-url "$RPC_URL" \
  --account "$ACCOUNT"
```

### Remove liquidity

```bash
cast send "$EXCHANGE" "removeLiquidity(uint256)" "$LP_AMOUNT" \
  --rpc-url "$RPC_URL" \
  --account "$ACCOUNT"
```

Read your LP balance:

```bash
cast call "$EXCHANGE" "balanceOf(address)(uint256)" "$(cast wallet address --account "$ACCOUNT")" \
  --rpc-url "$RPC_URL"
```

### Read reserves

```bash
cast balance "$EXCHANGE" --rpc-url "$RPC_URL"
cast call "$EXCHANGE" "getTokenReserves()(uint256)" --rpc-url "$RPC_URL"
```

---

## Deployment Records

Fill this table after each deployment. Never assume an address is valid without checking the chain ID.

| Network | Chain ID | Factory | Token | Exchange |
|---|---:|---|---|---|
| Local Anvil | 31337 | — | — | — |
| Sepolia | 11155111 | — | — | — |

Recommended record format:

```json
{
  "chainId": 11155111,
  "factory": "0x...",
  "token": "0x...",
  "exchange": "0x...",
  "deployer": "0x...",
  "timestamp": "2026-01-01T00:00:00Z"
}
```

Keep deployment records under version control only if they do not contain sensitive information. Never commit private keys or keystore passwords.

---

## Known Limitations

This is a practice implementation. The following limitations are intentional or unresolved and should be understood before using the code:

- **First LP sets the price.** The initial ETH/token ratio determines the starting price.
- **No ratio enforcement in `addLiquidity`.** Subsequent LPs can deposit an arbitrary token amount. The contract mints LP tokens based on ETH only, so a mismatched ratio changes the price and may transfer value between LPs.
- **No minimum liquidity lock.** The first LP can redeem nearly all liquidity, leaving rounding dust and potentially causing division-by-zero edge cases.
- **`removeLiquidity` invariant check uses integer division.** Rounding can cause valid removals to revert or make the check ineffective.
- **Quote helpers are swap-internal.** `getTokenAmount` and `getEthAmount` assume the input asset is already in the contract.
- **No deadline.** Swaps can be held and executed later by miners or searchers.
- **No router or multi-hop routing.** Each swap targets a single exchange.
- **No TWAP or oracle.** The spot price is easy to manipulate within a block.
- **No protocol fee.**
- **LP token naming is shared.** Every exchange uses the name and symbol `UNI-V1`.
- **`payable.transfer` is used.** It forwards only a 2300-gas stipend, which can break recipients with complex `receive` functions.
- **ERC20 return values are not checked.** `transfer` and `transferFrom` return values are ignored. Fee-on-transfer, rebasing, or non-standard tokens can break accounting.
- **Direct transfers can distort reserves.** Sending ETH or tokens directly to an exchange changes the reserves without minting LP tokens. There is no `sync` or `skim` function.
- **No upgradeability or governance.** The Factory and Exchange contracts are immutable.
- **Unaudited.** Do not use with real funds.

---

## Security Notes

- State-changing exchange functions use `ReentrancyGuard`.
- `tokenAddress` and `factoryAddress` are immutable.
- The Factory is permissionless: anyone can create an exchange for any token.
- `MyToken` has an owner-controlled `mint` function.
- Only use standard ERC20 tokens that revert on failed transfers or always return `true`.
- Treat all deployed addresses as chain-specific. Verify the chain ID before interacting.
- This codebase is for learning and experimentation. It is not a substitute for an audited production DEX.

---

## Troubleshooting

| Error | Cause / fix |
|---|---|
| `Factory_ExchangeAlreadyExists` | An exchange already exists for this token in this Factory |
| `Factory_InvalidTokenAddress` | Token address is `address(0)` |
| `Exchange_InvalidTokenAddress` | Exchange was constructed with `address(0)` |
| `Exchange_InvalidEthAmount` | Zero ETH sent, zero tokens added, or ETH output below `minEth` |
| `Exchange_InvalidTokenAmount` | Zero tokens added/removed, or token output below `minTokens` |
| `Exchange_InsufficientLiquidity` | Liquidity removal failed the ratio check, often due to rounding |
| `Exchange_InvalidValues` | `getAmount` received a zero input amount or zero input reserve |
| `ERC20InsufficientAllowance` | Approve the exchange before adding liquidity or selling tokens |
| Verification mismatch | Use the same compiler version and optimizer settings as deployment |
| Wrong `msg.sender` in a Foundry script | With `--account`, pass `--sender` explicitly; `--account` does not set the script caller automatically |

If you use a Foundry deployment script, always simulate first:

```bash
forge script <SCRIPT> -vvvv
```

Then broadcast:

```bash
forge script <SCRIPT> --broadcast --slow
```

If a broadcast is interrupted:

```bash
forge script <SCRIPT> --resume
```

---

## License

MIT. See the SPDX license identifiers in the source files.

---

## Author

YosefTamer

---

> **Reminder:** This is a practice project. Use Anvil and testnets, keep keys secure, and never deploy unaudited code to mainnet with real funds.
