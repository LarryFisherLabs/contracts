// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";


/**
 * @dev Required interface of a DenyList compliant contract.
 */
interface IDenyList is IERC165 {
    /**
    * @dev Event for tracking denied addresses.
    */
    event Deny(address indexed address_);

    /**
    * @dev Event for tracking re-approved addresses.
    */
    event Undeny(address indexed address_);

    /**
    * @dev Return true if given address is denied or false if given address is approved.
    */
    function isDenied(address addr_) external view returns (bool);

    /**
    * @dev Should be a function restricted to contract owner access to deny an address.
    * Should also trigger a Deny event.
    */
    function deny(address addr_) external;

    /**
    * @dev Should be a function restricted to contract owner access to re-approve(undeny) an address.
    * Should also trigger a Undeny event.
    */
    function undeny(address addr_) external;
}