-include .env

.PHONY: all test clean deploy fund help install snapshot format anvil zktest deployf deployt

DEFAULT_ANVIL_KEY := 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
DEFAULT_ZKSYNC_LOCAL_KEY := 0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110

all: clean remove install update build

clean  :; forge clean
remove :; rm -rf .gitmodules && rm -rf .git/modules/* && rm -rf lib && touch .gitmodules && git add . && git commit -m "modules"
install :; forge install cyfrin/foundry-devops@0.2.2 && forge install foundry-rs/forge-std@v1.8.2 && forge install openzeppelin/openzeppelin-contracts@v5.0.2
update:; forge update
build:; forge build
test :; forge test 
zktest :; foundryup-zksync && forge test --zksync && foundryup
snapshot :; forge snapshot
format :; forge fmt
anvil :; anvil -m 'test test test test test test test test test test test junk' --steps-tracing --block-time 1

# Default values for local network
NETWORK_ARGS = --rpc-url http://localhost:8545 --private-key $(DEFAULT_ANVIL_KEY) --broadcast

# Override NETWORK_ARGS if ARGS contains --network sepolia
ifneq (,$(findstring --network sepolia,$(ARGS)))
    NETWORK_ARGS = --rpc-url $(SEPOLIA_RPC_URL) --private-key $(SEPOLIA_KEY) --broadcast --gas-estimate-multiplier 800 -vvvv 
endif

deployf:
	@forge script script/DeployFactory.s.sol $(NETWORK_ARGS)

deployt:
	@forge script script/DeployToken.s.sol $(NETWORK_ARGS)