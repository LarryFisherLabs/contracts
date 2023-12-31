// SPDX-License-Identifier: GPL-3.0

// ###########################################################
// !!! UPDATE BASE_URI AND ERC721 NAME/SYMBOL ON MIGRATION !!!
// ###########################################################

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

string constant BASE_URI = "https://nft-api-bphk.onrender.com/1/coins/";

contract Coins is ERC721, Ownable {
    constructor() ERC721("Arcade Token", "AT") {}

    uint80 COUNTERS;
    uint64 minFee = 0.001 ether;
    string public baseURI = BASE_URI;

    mapping(address => uint) founderList;
    uint40[] public coins;

    event NewCoin(address indexed owner, uint newCoinId);

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function _getTierPrice(uint _color) internal view returns (uint) {
        uint _COUNTERS = COUNTERS;
        uint _totalCount = uint16(_COUNTERS);
        uint _colorCount = uint16(_COUNTERS>>(16 * (_color + 1)));
        uint _minFee = minFee;
        return _minFee * (_color + 1) + _totalCount / 9 * _minFee + _colorCount / 4 * _minFee * (_color + 1);
    }

    function _getTierPrices(bool _isDiscounted) internal view returns (uint[4] memory prices) {
        uint _discount = _isDiscounted ? 2 : 1;
        for (uint i = 0; i < 4; ++i) {
            prices[i] = _getTierPrice(i) / _discount;
        }
    }

    function _isOnFounderList(address _addy) internal view returns (bool) {
        uint _founderValue = founderList[_addy]>>8;
        if (_founderValue > 0) {
            return true;
        }
        return false;
    }

    function _createCoin(uint _miniVal, uint _color) private {
        uint _COUNTERS = COUNTERS;
        uint[4] memory _colorCounters = [uint16(_COUNTERS>>16), uint16(_COUNTERS>>32), uint16(_COUNTERS>>48), _COUNTERS>>64];
        uint _totalCount = uint16(_COUNTERS);
        uint newCoin = uint32(_miniVal);
        newCoin |= _color<<32;
        coins.push(uint40(newCoin));
        _safeMint(msg.sender, _totalCount);
        ++_totalCount;
        if (_color < 4) {
            ++_colorCounters[_color];
        }
        uint _newCounters = uint16(_totalCount);
        for (uint i; i < 4; ++i) {
            _newCounters |= _colorCounters[i]<<(16 * (i + 1));
        }
        COUNTERS = uint80(_newCounters);
        emit NewCoin(msg.sender, _totalCount - 1);
    }

    function updateBaseURI(string memory _newURI) external onlyOwner {
        baseURI = _newURI;
    }

    function addFounder(address _addy, uint _value) external onlyOwner {
        require(!_isOnFounderList(_addy), "Already set!");
        uint _miniVal = _value / 10**14;
        require(_miniVal > 0, "Founder must have a value!");
        founderList[_addy] |= _miniVal<<8;
    }

    function withdraw() external payable onlyOwner {
        address payable _owner = payable(owner());
        _owner.transfer(address(this).balance);
    }

    function createFounderCoin() external payable {
        require(_isOnFounderList(msg.sender), "Founders only!");
        uint _founder = founderList[msg.sender];
        uint _founderValue = _founder>>8;
        uint _founderBools = uint8(_founder);
        require(_founderBools>>1 == 0, "Already Minted!");
        uint _miniValue = _founderValue + msg.value / 10**14;
        _createCoin(_miniValue, 4);
        founderList[msg.sender] |= 2;
    }

    function createExactCoin(uint _color) external payable {
        require(_color < 4, "Color out of bounds!");
        uint _discount = 1;
        if (_isOnFounderList(msg.sender)) {
            uint _founderBools = uint8(founderList[msg.sender]);
            require(_founderBools>>1 == 1, "Mint founder coin first!");
            if (_founderBools % 2 == 0) {
                _discount = 2;
            }
        }
        if (_discount == 1) {
            require(uint16(COUNTERS) < 3000, "Coin limit reached!");
        }
        require(msg.value >= _getTierPrice(_color) / _discount, "Not enough eth!");
        _createCoin(msg.value * _discount / 10**14, _color);
        if (_discount == 2) {
            founderList[msg.sender] |= 1;
        }
    }

    function isOnFounderList(address _addy) external view returns (bool) {
        return _isOnFounderList(_addy);
    }

    function getFounder(address _addy) external view returns (uint value, bool isFounderCoinMinted, bool isDiscountUsed) {
        uint _founder = founderList[_addy];
        uint rawValue = _founder>>8;
        value = rawValue * 10**14;
        uint _founderBools = uint8(_founder);
        isDiscountUsed = _founderBools % 2 == 1 ? true : false;
        isFounderCoinMinted = _founderBools>>1 == 1 ? true : false;
    }

    function getTierPrices(bool _isDiscounted) external view returns (uint[4] memory) {
        return _getTierPrices(_isDiscounted);
    }

    function getCounters() external view returns (uint[5] memory) {
        uint _COUNTERS = COUNTERS;
        return [uint16(_COUNTERS), uint16(_COUNTERS>>16), uint16(_COUNTERS>>32), uint16(_COUNTERS>>48), _COUNTERS>>64];
    }

    function getCoin(uint _id) external view returns (uint value, uint color) {
        uint _coin = coins[_id];
        uint _rawValue = uint32(_coin);
        value = _rawValue * 10**14;
        color = _coin>>32;
    }
}
