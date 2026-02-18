// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IObservations {
    function claimTips(address recipient) external;
}

/// @dev A contract that cannot receive ETH.
contract MockNoReceive {
    function claim(address observations) external {
        IObservations(observations).claimTips(address(this));
    }
}
