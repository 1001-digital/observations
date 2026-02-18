// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IObservations {
    function claimTips(address recipient) external;
}

contract MockReentrantClaimer {
    IObservations public target;
    address public recipient;
    uint256 public reentrancyAttempts;

    function setTarget(address _target, address _recipient) external {
        target = IObservations(_target);
        recipient = _recipient;
    }

    function claim() external {
        target.claimTips(recipient);
    }

    receive() external payable {
        if (reentrancyAttempts == 0) {
            reentrancyAttempts++;
            // Try to re-enter claimTips
            target.claimTips(recipient);
        }
    }
}
