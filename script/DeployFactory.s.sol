// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {Factory} from "../src/Factory.sol";
import {console} from "forge-std/console.sol";

contract DeployFactory is Script {
    function run() external {
        vm.startBroadcast();

        Factory factory = new Factory();
        console.log("Factory deployed at:", address(factory));

        vm.stopBroadcast();
    }
}
