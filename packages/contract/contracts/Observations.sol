// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { ClaimableTips } from "./ClaimableTips.sol";

/**
-------------------------------------
|                                   |
|     ·  ·  ·  ·  ·  ·  ●  ·  ·     |
|     ·  ·  ·  ·  ·  ·  ·  ·  ·     |
|     ·  ●  ·  ·  ·  ·  ·  ·  ·     |
|     ·  ·  ·  ·  ●  ·  ·  ·  ·     |
|     ·  ·  ·  ·  ·  ·  ·  ·  ●     |
|     ·  ·  ●  ·  ·  ·  ·  ·  ·     |
|     ·  ·  ·  ·  ·  ·  ·  ●  ·     |
|     ·  ●  ·  ·  ·  ●  ·  ·  ·     |
|     ·  ·  ·  ●  ·  ·  ·  ·  ·     |
|                                   |
-------------------------------------
@title  Observations
@notice Leave observations on Ethereum artifacts.
*/
contract Observations {
    using ClaimableTips for ClaimableTips.Tips;

    /// @dev Tracks observation history for a given artifact.
    struct Artifact {
        uint64 count;
        uint128 firstBlock;
    }

    /// @notice Emitted when someone leaves an observation.
    event Observation(
        address indexed collection,
        uint256 indexed tokenId,
        address indexed observer,
        uint64 id,
        uint64 parent,
        bool update,
        string note,
        bool located,
        int32 x,
        int32 y,
        uint8 viewType,
        uint32 time,
        uint256 tip,
        address recipient
    );

    /// @dev collection => tokenId => Artifact
    mapping(address => mapping(uint256 => Artifact)) public artifacts;

    /// @notice Accumulated tips per recipient.
    mapping(address => ClaimableTips.Tips) public tips;

    /// @notice Leave an observation on an artifact.
    /// @param collection The token contract address.
    /// @param tokenId The token ID within that collection.
    /// @param parent The ID of the parent observation (0 = top-level).
    /// @param update Whether this is an update to the parent observation.
    /// @param note The observation text.
    /// @param viewType The view type (0 = image, 1 = animation).
    /// @param time The time in seconds within the media (0 = no specific time).
    /// @param recipient The address to receive the tip.
    function observe(
        address collection,
        uint256 tokenId,
        uint64 parent,
        bool update,
        string calldata note,
        uint8 viewType,
        uint32 time,
        address recipient
    ) external payable {
        require(msg.value == 0 || recipient != address(0), "Invalid recipient");
        uint64 id = _record(collection, tokenId, parent, update);
        tips[recipient].deposit();

        emit Observation(collection, tokenId, msg.sender, id, parent, update, note, false, 0, 0, viewType, time, msg.value, recipient);
    }

    /// @notice Leave an observation at specific coordinates on an artifact.
    /// @param collection The token contract address.
    /// @param tokenId The token ID within that collection.
    /// @param parent The ID of the parent observation (0 = top-level).
    /// @param update Whether this is an update to the parent observation.
    /// @param note The observation text.
    /// @param x The x coordinate on the artifact.
    /// @param y The y coordinate on the artifact.
    /// @param viewType The view type (0 = image, 1 = animation).
    /// @param time The time in seconds within the media (0 = no specific time).
    /// @param recipient The address to receive the tip.
    function observeAt(
        address collection,
        uint256 tokenId,
        uint64 parent,
        bool update,
        string calldata note,
        int32 x,
        int32 y,
        uint8 viewType,
        uint32 time,
        address recipient
    ) external payable {
        require(msg.value == 0 || recipient != address(0), "Invalid recipient");
        uint64 id = _record(collection, tokenId, parent, update);
        tips[recipient].deposit();

        emit Observation(collection, tokenId, msg.sender, id, parent, update, note, true, x, y, viewType, time, msg.value, recipient);
    }

    /// @notice Claim accumulated tips for a recipient.
    /// @param recipient The recipient address to claim tips for.
    function claimTips(address recipient) external {
        bool authorized = msg.sender == recipient;

        if (!authorized && msg.sender == ClaimableTips.UNCLAIMED_TIPS_RECIPIENT) {
            require(
                block.timestamp - tips[recipient].unclaimedSince > 365 days,
                "Tips not yet claimable"
            );
            authorized = true;
        }

        require(authorized, "Not authorized");

        tips[recipient].claim(recipient);
    }

    /// @dev Track the observation count and first observation block for an artifact.
    function _record(
        address collection, uint256 tokenId, uint64 parent, bool update
    ) internal returns (uint64 id) {
        Artifact storage a = artifacts[collection][tokenId];

        if (a.count == 0) {
            a.firstBlock = uint128(block.number);
        }

        unchecked { ++a.count; }
        id = a.count;

        require(parent < id, "Invalid parent");
        require(!update || parent != 0, "Update requires parent");
    }
}

// - by jalil, inspired by Sam Spratt's "The Monument Game"
