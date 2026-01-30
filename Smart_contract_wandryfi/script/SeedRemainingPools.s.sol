// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {WandryFi} from "../src/WandryFi.sol";

/**
 * @title SeedRemainingPools
 * @notice Seeds only pools 6, 7, 8 that weren't seeded before
 */
contract SeedRemainingPools is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address contractAddress = vm.envAddress("CONTRACT_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        WandryFi wandryFi = WandryFi(contractAddress);

        console.log("Seeding remaining pools (6, 7, 8)...");
        console.log("Contract Address:", contractAddress);

        // Seed remaining pools with minimal amounts (0.01 TMON each)
        uint256 minSeed = 10000000000000000; // 0.01 TMON

        wandryFi.seedPool{value: minSeed}(6); // Jaisalmer Fort
        console.log("Pool 6 seeded: 0.01 TMON");

        wandryFi.seedPool{value: minSeed}(7); // IIIT Dharwad
        console.log("Pool 7 seeded: 0.01 TMON");

        wandryFi.seedPool{value: minSeed}(8); // LNMIIT Jaipur
        console.log("Pool 8 seeded: 0.01 TMON");

        console.log("Remaining pools seeded successfully!");
        console.log("Total seeded: 0.03 TMON");

        vm.stopBroadcast();
    }
}
