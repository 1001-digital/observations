// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IObservations {
    function claimTips(address collection) external;
}

contract MockReentrantClaimer {
    IObservations public target;
    address public collection;
    uint256 public reentrancyAttempts;

    function setTarget(address _target, address _collection) external {
        target = IObservations(_target);
        collection = _collection;
    }

    function claim() external {
        target.claimTips(collection);
    }

    function owner() external view returns (address) {
        return address(this);
    }

    receive() external payable {
        if (reentrancyAttempts == 0) {
            reentrancyAttempts++;
            // Try to re-enter claimTips
            target.claimTips(collection);
        }
    }
}
