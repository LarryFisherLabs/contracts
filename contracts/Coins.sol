// SPDX-License-Identifier: GPL-3.0

// ###########################################################
// !!! UPDATE BASE_URI AND ERC721 NAME/SYMBOL ON MIGRATION !!!
// ###########################################################

pragma solidity ^0.8.0;

import "./custom-erc721/ERC721J.sol";

string constant BASE_URI = "https://nft-api-bphk.onrender.com/coins/11155111/1/";

contract Coins is ERC721J {
    uint public COUNTER;
    uint public minFee = 0.001 ether;

    constructor(address denyListAddress_) ERC721J("Arcade Token 0.0", "AT00", BASE_URI, denyListAddress_) {}

    mapping(address => uint) founderMiniVals;
    mapping(uint => uint) isDiscountAvailById;
    uint16[4] public COLOR_COUNTS;
    uint40[] public coins;

    event NewCoin(address indexed owner, uint newCoinId);

    function _getTierPrice(uint _color) private view returns (uint) {
        uint _minFee = minFee;
        return _minFee * (_color + 1) + COUNTER / 9 * _minFee + COLOR_COUNTS[_color] / 4 * _minFee * (_color + 1);
    }

    function _createCoin(uint _miniVal, uint _color) private {
        uint _id = COUNTER;
        uint newCoin = uint32(_miniVal);
        newCoin |= _color<<32;
        coins.push(uint40(newCoin));
        _mint(msg.sender, _id);
        ++COUNTER;
        if (_color < 4) {
            COLOR_COUNTS[_color]++;
        }
        emit NewCoin(msg.sender, _id);
    }

    function addFounder(address _addy, uint _value) external onlyOwner {
        uint _miniVal = _value / 10**14;
        require(_miniVal > 0);
        founderMiniVals[_addy] = _miniVal;
    }

    function withdraw() external payable onlyOwner {
        address payable _owner = payable(owner());
        _owner.transfer(address(this).balance);
    }

    function createFounderCoin() external payable {
        uint _founderMiniVal = founderMiniVals[msg.sender];
        founderMiniVals[msg.sender] = 0;
        require(_founderMiniVal > 0);
        _createCoin((msg.value / 10**14 + _founderMiniVal), 4);
        isDiscountAvailById[(COUNTER - 1)] = 1;
    }

    function createDiscountCoin(uint _color, uint _founderCoinId) external payable {
        require((_color < 4) && (isDiscountAvailById[_founderCoinId] == 1) && (ownerOf(_founderCoinId) == msg.sender));
        require(msg.value >= _getTierPrice(_color) / 2, "Not enough eth!");
        isDiscountAvailById[_founderCoinId] = 0;
        _createCoin((msg.value / 10**14 * 2), _color);
    }

    function createCoin(uint _color) external payable {
        require((_color < 4) && (COUNTER < 3000));
        require(msg.value >= _getTierPrice(_color), "Not enough eth!");
        _createCoin(msg.value / 10**14, _color);
    }

    function getFounderMiniVal(address _addy) external view returns (uint miniVal) {
        miniVal = founderMiniVals[_addy];
    }

    function isDiscountMintAvail(uint _coinId) external view returns (bool) {
        if (isDiscountAvailById[_coinId] == 1) return true;
        return false;
    }

    function getTierPrices(bool _isDiscounted) external view returns (uint[4] memory prices) {
        for (uint i; i < 4; ++i) {
            prices[i] = _isDiscounted ? _getTierPrice(i) / 2 : _getTierPrice(i);
        }
    }

    function getCounters() external view returns (uint[5] memory counters) {
        counters = [uint(COUNTER), COLOR_COUNTS[0], COLOR_COUNTS[1], COLOR_COUNTS[2], COLOR_COUNTS[3]];
    }

    function getCoin(uint _id) external view returns (uint value, uint color) {
        uint _coin = coins[_id];
        uint _rawValue = uint32(_coin);
        value = _rawValue * 10**14;
        color = _coin>>32;
    }
}
