// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

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

    /// @dev Tracks observation history for a given artifact.
    struct Artifact {
        uint128 count;
        uint128 firstBlock;
    }

    /// @dev Tracks accumulated tips for a given collection.
    struct CollectionTips {
        uint128 balance;
        uint128 unclaimedSince;
    }

    /// @notice Emitted when someone leaves an observation.
    event Observation(
        address indexed collection,
        uint256 indexed tokenId,
        address indexed observer,
        string note,
        bool located,
        int32 x,
        int32 y,
        uint8 viewType,
        uint32 time,
        uint256 tip
    );

    /// @notice Emitted when tips are claimed for a collection.
    event TipsClaimed(
        address indexed collection,
        address indexed claimant,
        uint256 amount
    );

    /// @notice The protocol owner (deployer), can sweep unclaimed tips after 1 year.
    address public immutable protocolOwner;

    /// @dev collection => tokenId => Artifact
    mapping(address => mapping(uint256 => Artifact)) public artifacts;

    /// @notice Accumulated tips per collection.
    mapping(address => CollectionTips) public tips;

    constructor() {
        protocolOwner = msg.sender;
    }

    /// @notice Leave an observation on an artifact.
    /// @param collection The token contract address.
    /// @param tokenId The token ID within that collection.
    /// @param note The observation text.
    /// @param viewType The view type (0 = image, 1 = animation).
    /// @param time The time in seconds within the media (0 = no specific time).
    function observe(
        address collection,
        uint256 tokenId,
        string calldata note,
        uint8 viewType,
        uint32 time
    ) external payable {
        _record(collection, tokenId);
        _tip(collection);

        emit Observation(collection, tokenId, msg.sender, note, false, 0, 0, viewType, time, msg.value);
    }

    /// @notice Leave an observation at specific coordinates on an artifact.
    /// @param collection The token contract address.
    /// @param tokenId The token ID within that collection.
    /// @param note The observation text.
    /// @param x The x coordinate on the artifact.
    /// @param y The y coordinate on the artifact.
    /// @param viewType The view type (0 = image, 1 = animation).
    /// @param time The time in seconds within the media (0 = no specific time).
    function observeAt(
        address collection,
        uint256 tokenId,
        string calldata note,
        int32 x,
        int32 y,
        uint8 viewType,
        uint32 time
    ) external payable {
        _record(collection, tokenId);
        _tip(collection);

        emit Observation(collection, tokenId, msg.sender, note, true, x, y, viewType, time, msg.value);
    }

    /// @notice Claim accumulated tips for a collection.
    /// @param collection The collection address to claim tips for.
    function claimTips(address collection) external {
        CollectionTips storage t = tips[collection];
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

        // Check if caller is protocol owner (only after 1 year)
        if (!authorized && msg.sender == protocolOwner) {
            require(
                block.timestamp - t.unclaimedSince > 365 days,
                "Tips not yet sweepable"
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

    /// @dev Track the observation count and first observation block for an artifact.
    function _record(address collection, uint256 tokenId) internal {
        Artifact storage a = artifacts[collection][tokenId];

        if (a.count == 0) {
            a.firstBlock = uint128(block.number);
        }

        unchecked { ++a.count; }
    }

    /// @dev Track tip accumulation per collection.
    function _tip(address collection) internal {
        if (msg.value == 0) return;

        CollectionTips storage t = tips[collection];
        if (t.balance == 0) t.unclaimedSince = uint128(block.timestamp);
        t.balance += uint128(msg.value);
    }
}

// - by jalil, inspired by Sam Spratt's "The Monument Game"
