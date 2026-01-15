//SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {WandryFi} from "../src/WandryFi.sol";
import {HelperConfig} from "./HelperConfig.s.sol";
import {Script, console} from "forge-std/Script.sol";

contract DeployScript is Script {
    function run() external returns (WandryFi) {
        HelperConfig helperConfig = new HelperConfig();
        (address verifier, address treasury, uint256 feePercent) = helperConfig
            .activeNetworkConfig();
        vm.startBroadcast();
        WandryFi wandryFi = new WandryFi(verifier, treasury, feePercent);
        vm.stopBroadcast();
        return wandryFi;
    }
}
