// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @dev Required interface of an ERC721J compliant contract.
 */
interface IERC721J is IERC721 {
    /**
     * @dev Should be a function restricted to contract owner access to change base uri of all tokens.
     * Should also reset URI contract variable as one or the other URI method should be used at once.
     */
    function updateBaseURI(string memory newURI_) external;

    /**
     * @dev Should be a function restricted to contract owner access to change contract address for contract that gets token URIs.
     * Should also reset base URI variable as one or the other URI method should be used at once.
     */
    function setURIContract(address uriAddress_) external;

    /**
     * @dev Should be a function restricted to contract owner access to change contract address for deny list contract.
     */
    function setDenyContract(address denyAddress_) external;
}