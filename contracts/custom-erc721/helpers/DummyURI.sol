// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "./IExternalURI.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

contract DummyURI is IExternalURI, ERC165 {
    mapping(uint => string) uris;
    mapping(uint => bool) isURISet;
    string defaultURI = "test";

    function getURI(uint tokenId_) external view returns(string memory) {
        if (isURISet[tokenId_]) return uris[tokenId_];
        else return defaultURI;
    }

    function setDefaultURI(string memory newURI_) external {
        defaultURI = newURI_;
    }
}