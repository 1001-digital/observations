// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @notice Tracks claimable ETH tips per recipient.
/// Recipients can claim at any time.
/// If unclaimed for over 1 year, the unclaimed tips recipient can sweep.
library ClaimableTips {

    struct Tips {
        uint128 balance;
        uint128 unclaimedSince;
    }

    event TipsClaimed(
        address indexed recipient,
        address indexed claimant,
        uint256 amount
    );

    /// @notice Can sweep tips left uncollected for over 1 year.
    /// @dev This is a developer safe multisig account.
    address internal constant UNCLAIMED_TIPS_RECIPIENT = 0x5Ca3d797BF631603efCB3885C8B50A6d60834600;

    /// @dev Accumulate a tip for a recipient.
    function deposit(Tips storage t) internal {
        if (msg.value == 0) return;
        if (t.balance == 0) t.unclaimedSince = uint128(block.timestamp);
        t.balance += uint128(msg.value);
    }

    /// @dev Claim accumulated tips. The calling contract handles authorization.
    /// @param t The tips storage to claim from.
    /// @param recipient The recipient address (used in the emitted event).
    function claim(Tips storage t, address recipient) internal {
        uint256 amount = t.balance;
        require(amount > 0, "No tips to claim");

        // Effects before interactions (single SSTORE — clears both packed fields)
        t.balance = 0;
        t.unclaimedSince = 0;

        // Transfer
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Transfer failed");

        emit TipsClaimed(recipient, msg.sender, amount);
    }
}
