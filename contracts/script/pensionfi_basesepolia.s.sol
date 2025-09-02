// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24; // Updated pragma to match pensionfi_basesepolia.sol

import {Script, console} from "forge-std/Script.sol";
import {PensionMinimal} from "../src/pensionfi_basesepolia.sol"; // Changed import to PensionMinimal

contract PensionMinimalScript is Script { // Renamed contract to reflect PensionMinimal
    PensionMinimal public pensionMinimal; // Changed state variable type and name

    // Removed setUp() as it was empty and not needed for this script

    function run() public {
        vm.startBroadcast();

        pensionMinimal = new PensionMinimal(); // Deployed the PensionMinimal contract

        vm.stopBroadcast();
    }
}
