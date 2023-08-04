// SPDX-License-Identifier: GPL-3.0

// ###########################################################
// !!! UPDATE BASE_URI AND ERC721 NAME/SYMBOL ON MIGRATION !!!
// ###########################################################

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./AntParts.sol";

string constant BASE_URI = "https://nft-api-bphk.onrender.com/1/ants/";

interface ICoins {
    function getCoin(uint) external view returns (uint, uint);
    function ownerOf(uint) external view returns (address);
}

contract Ants is ERC721, Ownable, AntParts {
    uint16 public COUNTER;
    address coinAddr;
    string public baseURI = BASE_URI;
    uint64 public nameFee = .0025 ether;

    constructor(address _coinAddr) ERC721("Army Ants", "AA") {
        coinAddr = _coinAddr;
    }

    uint120[] public ants;

    mapping(uint16 => string) names;
    mapping(uint16 => bool) isDiscountUsedByID;

    event NewAnt(address indexed owner, uint id);

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function _createDna(uint _rawDna) internal pure returns (uint[17] memory resultDna) {
        for (uint i; i < 17; ++i) {
            resultDna[i] = _rawDna / 100 ** (14 - i) % 100;
        }
    }

    function _createRawDna(uint[17] memory _dna) internal pure returns (uint120 resultDna) {
        for (uint i; i < 17; ++i) {
            resultDna = uint120(resultDna * 100 + _dna[i]);
        }
    }

    function _createAnt(uint120 _rawDna, address _recipient) private {
        require(COUNTER < 10000, "Ant limit reached!");
        ants.push(_rawDna);
        _safeMint(_recipient, COUNTER);
        emit NewAnt(_recipient, COUNTER);
        COUNTER++;
    }

    function withdraw() external payable onlyOwner {
        address payable _owner = payable(owner());
        _owner.transfer(address(this).balance);
    }

    function isDiscountUsed(uint16 _id) external view returns (bool) {
        return isDiscountUsedByID[_id];
    }

    function updateBaseURI(string memory _newURI) external onlyOwner {
        baseURI = _newURI;
    }

    function updateCoinAddr(address _coinAddr) external onlyOwner {
        coinAddr = _coinAddr;
    }

    function updateNameFee(uint64 _nameFee) external onlyOwner {
        nameFee = _nameFee;
    }

    function updateRarityPriceScale(uint _index, uint16 _newPriceScale) external onlyOwner {
        priceScaleByRarity[_index] = _newPriceScale;
    }

    function changeName(uint16 _id, string memory _newName) external payable {
        require(msg.sender == ownerOf(_id), "Must be owner of ant!");
        require(msg.value >= nameFee, "Not enough ETH!");
        names[_id] = _newName;
    }

    function createAnt(uint[17] memory _dna) external payable {
        uint120 rawDna = _createRawDna(_dna);
        uint price = _getDnaPrice(_dna, 0);
        require(msg.value >= price, "Not enough ETH!");
        _createAnt(rawDna, msg.sender);
        _incrementCounts(_dna);
    }

    function createDiscountAnt(uint16 _coinId, uint[17] memory _dna) external payable {
        require(ICoins(coinAddr).ownerOf(_coinId) == msg.sender, "You don't own that coin!");
        require(!isDiscountUsedByID[_coinId], "Discount already used!");
        uint120 rawDna = _createRawDna(_dna);
        (, uint color) = ICoins(coinAddr).getCoin(_coinId);
        uint price = _getDnaPrice(_dna, color + 1);
        require(msg.value >= price, "Not enough ETH!");
        _createAnt(rawDna, msg.sender);
        _incrementCounts(_dna);
        isDiscountUsedByID[_coinId] = true;
    }

    function createPromotionalAnt(address _recipient, uint[17] memory _dna) external onlyOwner {
        uint120 rawDna = _createRawDna(_dna);
        _createAnt(rawDna, _recipient);
    }

    function getDnaPrice(uint[17] memory _dna, uint _discountIndex) external view returns (uint price) {
        require(_discountIndex < 6, "Discount index out of bounds!");
        price = _getDnaPrice(_dna, _discountIndex);
    }

    function getAnt(uint16 _id) external view returns (uint[17] memory dna, uint[17] memory rarities, string memory antName) {
        dna = _createDna(ants[_id]);
        rarities = _getRarities(dna);
        antName = names[_id];
    }
}
