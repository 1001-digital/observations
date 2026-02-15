// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @notice Tracks claimable ETH tips per collection.
/// Collection owners can claim at any time.
/// If unclaimed for over 1 year, the unclaimed tips recipient can claim.
library ClaimableTips {

    struct Tips {
        uint128 balance;
        uint128 unclaimedSince;
    }

    event TipsClaimed(
        address indexed collection,
        address indexed claimant,
        uint256 amount
    );

    /// @notice Can claim tips left uncollected for over 1 year.
    /// @dev This is a developer safe multisig account.
    address internal constant UNCLAIMED_TIPS_RECIPIENT = 0x5Ca3d797BF631603efCB3885C8B50A6d60834600;

    /// @dev Accumulate a tip for a collection.
    function deposit(Tips storage t) internal {
        if (msg.value == 0) return;
        if (t.balance == 0) t.unclaimedSince = uint128(block.timestamp);
        t.balance += uint128(msg.value);
    }

    /// @dev Claim accumulated tips for a collection.
    function claim(Tips storage t, address collection) internal {
        uint256 amount = t.balance;
        require(amount > 0, "No tips to claim");

        // Determine authorization
        bool authorized = false;

        // Check if caller is collection owner
        (bool success, bytes memory data) = collection.staticcall(
            abi.encodeWithSignature("owner()")
        );
        if (success && data.length >= 32) {
            address collectionOwner = abi.decode(data, (address));
            if (msg.sender == collectionOwner) {
                authorized = true;
            }
        }

        // Check if caller is unclaimed tips recipient (only after 1 year)
        if (!authorized && msg.sender == UNCLAIMED_TIPS_RECIPIENT) {
            require(
                block.timestamp - t.unclaimedSince > 365 days,
                "Tips not yet claimable"
            );
            authorized = true;
        }

        require(authorized, "Not authorized");

        // Effects before interactions (single SSTORE — clears both packed fields)
        t.balance = 0;
        t.unclaimedSince = 0;

        // Transfer
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Transfer failed");

        emit TipsClaimed(collection, msg.sender, amount);
    }
}
