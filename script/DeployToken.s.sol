// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {MyToken} from "../src/ERC20.sol";
import {console} from "forge-std/console.sol";

contract DeployToken is Script {
    function run() external {
        vm.startBroadcast();

        MyToken token = new MyToken(msg.sender);
        console.log("MyToken deployed at:", address(token));

        vm.stopBroadcast();
    }
}
