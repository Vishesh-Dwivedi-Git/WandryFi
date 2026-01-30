// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script, console} from "forge-std/Script.sol";
import {WandryFi} from "../src/WandryFi.sol";

/**
 * @title SeedPoolsMinimal
 * @notice Minimal pool seeding script - uses only 0.08 TMON total
 * @dev Use this if you have limited testnet funds
 */
contract SeedPoolsMinimal is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address contractAddress = vm.envAddress("CONTRACT_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        WandryFi wandryFi = WandryFi(contractAddress);

        console.log("Starting Minimal Pool Seeding Process...");
        console.log("Contract Address:", contractAddress);

        // Seed pools with minimal amounts (0.01 TMON each)
        uint256 minSeed = 10000000000000000; // 0.01 TMON

        wandryFi.seedPool{value: minSeed}(1); // Everest Base Camp
        console.log("Pool 1 seeded: 0.01 TMON");

        wandryFi.seedPool{value: minSeed}(2); // Chadar Trek
        console.log("Pool 2 seeded: 0.01 TMON");

        wandryFi.seedPool{value: minSeed}(3); // Hemkund Sahib
        console.log("Pool 3 seeded: 0.01 TMON");

        wandryFi.seedPool{value: minSeed}(4); // Key Monastery
        console.log("Pool 4 seeded: 0.01 TMON");

        wandryFi.seedPool{value: minSeed}(5); // Havelock Island
        console.log("Pool 5 seeded: 0.01 TMON");

        wandryFi.seedPool{value: minSeed}(6); // Jaisalmer Fort
        console.log("Pool 6 seeded: 0.01 TMON");

        wandryFi.seedPool{value: minSeed}(7); // IIIT Dharwad
        console.log("Pool 7 seeded: 0.01 TMON");

        wandryFi.seedPool{value: minSeed}(8); // LNMIIT Jaipur
        console.log("Pool 8 seeded: 0.01 TMON");

        console.log("All pools seeded successfully!");
        console.log("Total seeded: 0.08 TMON");

        vm.stopBroadcast();
    }
}
