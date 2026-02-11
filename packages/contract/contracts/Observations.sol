// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
    -----------------------------------------
    |   ·   ·   ·   ·   ·   ·   ●   ·   ·   |
    |   ·   ·   ·   ·   ·   ·   ·   ·   ·   |
    |   ·   ●   ·   ·   ·   ·   ·   ·   ·   |
    |   ·   ·   ·   ·   ●   ·   ·   ·   ·   |
    |   ·   ·   ·   ·   ·   ·   ·   ·   ●   |
    |   ·   ·   ●   ·   ·   ·   ·   ·   ·   |
    |   ·   ·   ·   ·   ·   ·   ·   ●   ·   |
    |   ●   ·   ·   ·   ·   ●   ·   ·   ·   |
    |   ·   ·   ·   ●   ·   ·   ·   ·   ·   |
    -----------------------------------------
@title  Observations
@notice Leave observations on any ERC-721 / ERC-1155 artifact.
*/
contract Observations {

    /// @dev Tracks observation history for a given artifact.
    struct Artifact {
        uint128 count;
        uint128 firstBlock;
    }

    /// @notice Emitted when someone leaves an observation.
    event Observation(
        address indexed collection,
        uint256 indexed tokenId,
        address indexed observer,
        string note,
        bool located,
        int32 x,
        int32 y
    );

    /// @dev collection => tokenId => Artifact
    mapping(address => mapping(uint256 => Artifact)) public artifacts;

    /// @notice Leave an observation on an artifact.
    /// @param collection The token contract address.
    /// @param tokenId The token ID within that collection.
    /// @param note The observation text.
    function observe(
        address collection,
        uint256 tokenId,
        string calldata note
    ) external {
        _record(collection, tokenId);

        emit Observation(collection, tokenId, msg.sender, note, false, 0, 0);
    }

    /// @notice Leave an observation at specific coordinates on an artifact.
    /// @param collection The token contract address.
    /// @param tokenId The token ID within that collection.
    /// @param note The observation text.
    /// @param x The x coordinate on the artifact.
    /// @param y The y coordinate on the artifact.
    function observeAt(
        address collection,
        uint256 tokenId,
        string calldata note,
        int32 x,
        int32 y
    ) external {
        _record(collection, tokenId);

        emit Observation(collection, tokenId, msg.sender, note, true, x, y);
    }

    /// @dev Track the observation count and first observation block for an artifact.
    function _record(address collection, uint256 tokenId) internal {
        Artifact storage a = artifacts[collection][tokenId];

        if (a.count == 0) {
            a.firstBlock = uint128(block.number);
        }

        unchecked { ++a.count; }
    }
}

// - by jalil, inspired by Sam Spratt's "The Monument Game"

