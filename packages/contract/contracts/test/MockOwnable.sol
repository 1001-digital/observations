// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MockOwnable {
    address public owner;

    constructor(address _owner) {
        owner = _owner;
    }

    function transferOwnership(address _newOwner) external {
        owner = _newOwner;
    }
}
