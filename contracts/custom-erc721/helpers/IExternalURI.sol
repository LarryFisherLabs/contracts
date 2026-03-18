// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";


/**
 * @dev Required interface of a ExternalURI compliant contract.
 */
interface IExternalURI is IERC165 {
    /**
    * @dev Event for tracking URI updates.
    */
    event TokenURIUpdate(address indexed owner_, uint indexed tokenId_);

    /**
    * @dev Get URI of a specific token ID.
    */
    function getURI(uint tokenId_) external view returns(string memory);

    /**
    * @dev Set default URI for all tokens.
    */
    function setDefaultURI(string memory) external;
}