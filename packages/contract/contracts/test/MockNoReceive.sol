// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IObservations {
    function claimTips(address collection) external;
}

/// @dev A contract that owns itself and cannot receive ETH.
contract MockNoReceive {
    function owner() external view returns (address) {
        return address(this);
    }

    function claim(address observations) external {
        IObservations(observations).claimTips(address(this));
    }
}
