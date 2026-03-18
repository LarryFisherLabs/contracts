// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "./IDenyList.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

/**
* @dev The purpose of the DenyList contract is to allow NFT collections built using the IERC721J
* standard to block certain address's from being approved to transfer the collection's NFTs.
* A single DenyList contract can be shared by many NFT collections in a permisionless manner.
*/
contract DenyList is IDenyList, ERC165, Ownable {
    mapping(address => bool) private denyList;

    /**
    * @dev See {IERC165-supportsInterface}.
    */
    function supportsInterface(bytes4 interfaceId) public view override(ERC165, IERC165) returns (bool) {
        return
            interfaceId == type(IDenyList).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
    * @dev See {IDenyList-isDenied}.
    */
    function isDenied(address addr_) external view returns (bool isDenied_) {
        isDenied_ = denyList[addr_];
    }

    /**
    * @dev See {IDenyList-deny}.
    */
    function deny(address addr_) external onlyOwner {
        denyList[addr_] = true;
        emit Deny(addr_);
    }

    // /**
    // * @dev Batch deny option.
    // */
    // function batchDeny(address[] memory addrs_) external onlyOwner {
    //     for (uint i; i < addrs_.length; ++i) {
    //         denyList[addrs_[i]] = true;
    //         emit Deny(addrs_[i]);
    //     }
    // }

    /**
    * @dev See {IDenyList-undeny}.
    */
    function undeny(address addr_) external onlyOwner {
        denyList[addr_] = false;
        emit Undeny(addr_);
    }
}