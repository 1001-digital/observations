// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MockShortReturnOwner {
    fallback() external {
        assembly {
            // Return only 20 bytes (less than 32), simulating a malformed owner()
            mstore(0, 0xFF)
            return(0, 20)
        }
    }
}
