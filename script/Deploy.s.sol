// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {Factory} from "../src/Factory.sol";
import {MyToken} from "../src/ERC20.sol";
import {console} from "forge-std/console.sol";

contract DeployScript is Script {
    function run() external {
        vm.startBroadcast();

        // 1. Deploy the ERC20 Token (passing the deployer as the initial owner)
        MyToken token = new MyToken(msg.sender);
        console.log("MyToken deployed at:", address(token));

        // 2. Deploy the Factory Contract
        Factory factory = new Factory();
        console.log("Factory deployed at:", address(factory));

        // 3. Create an Exchange for the Token via the Factory
        address exchangeAddress = factory.createNewExchange(address(token));
        console.log("Exchange for MyToken deployed at:", exchangeAddress);

        vm.stopBroadcast();
    }
}
