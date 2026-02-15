// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MockRevertingOwner {
    function owner() external pure {
        revert("no owner");
    }
}
