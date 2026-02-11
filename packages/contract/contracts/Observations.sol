// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Observations {
    struct Artifact {
        uint128 count;
        uint128 firstBlock;
    }

    event Observation(
        address indexed collection,
        uint256 indexed tokenId,
        address indexed observer,
        string note,
        bool pinned,
        int32 x,
        int32 y
    );

    mapping(address => mapping(uint256 => Artifact)) public artifacts;

    function observe(
        address collection,
        uint256 tokenId,
        string calldata note
    ) external {
        _record(collection, tokenId);
        emit Observation(collection, tokenId, msg.sender, note, false, 0, 0);
    }

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

    function _record(address collection, uint256 tokenId) internal {
        Artifact storage a = artifacts[collection][tokenId];
        if (a.count == 0) {
            a.firstBlock = uint128(block.number);
        }
        unchecked { a.count++; }
    }
}
