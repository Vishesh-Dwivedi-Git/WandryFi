//SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";

contract HelperConfig is Script {
    uint256 public chainId = block.chainid;

    struct NetworkConfig {
        address verifierAddress;
        address treasuryAddress;
        uint256 initialFeePercent;
    }

    NetworkConfig public activeNetworkConfig;

    constructor() {
        if (chainId == 31337) {
            activeNetworkConfig = getAnvilConfig();
        } else if (chainId == 88888) {
            activeNetworkConfig = getMonadConfig();
        } else {
            activeNetworkConfig = getAnvilConfig();
        }
    }

    function getAnvilConfig() public pure returns (NetworkConfig memory) {
        return
            NetworkConfig({
                verifierAddress: address(0x123),
                treasuryAddress: address(0x456),
                initialFeePercent: 2
            });
    }

    function getMonadConfig() public view returns (NetworkConfig memory) {
        address verifier = vm.envAddress("VERIFIER_ADDRESS");
        address treasury = vm.envAddress("TREASURY_ADDRESS");

        if (verifier == address(0)) {
            revert("VERIFIER_ADDRESS is not set in env");
        }
        if (treasury == address(0)) {
            revert("TREASURY_ADDRESS is not set in env");
        }

        return
            NetworkConfig({
                verifierAddress: verifier,
                treasuryAddress: treasury,
                initialFeePercent: 2
            });
    }
}
