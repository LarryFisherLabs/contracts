// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./AntParts.sol";

interface ICoins {
    function getColor(uint) external view returns (uint);
    function ownerOf(uint) external view returns (address);
}

contract Ants is ERC721, Ownable, AntParts {
    uint16 public COUNTER;
    address coinAddr;
    string baseURI = "localhost:3001/ants/";

    constructor(address _coinAddr) ERC721("ArmyAnts", "AA") {
        coinAddr = _coinAddr;
    }

    uint104[] public ants;

    mapping(uint16 => bool) isDiscountUsedByID;

    event NewAnt(address indexed owner, uint id);

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function _createDna(uint _rawDna) internal pure returns (uint[15] memory resultDna) {
        for (uint i; i < 15; ++i) {
            resultDna[i] = _rawDna / 100 ** (14 - i) % 100;
        }
    }

    function _createAnt(uint104 _rawDna, address _recipient) private {
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

    function updateMaxStock(uint _maxStockIndex, uint16 _newMaxStock) external onlyOwner {
        _updateMaxStock(_maxStockIndex, _newMaxStock);
    }

    function updatePriceScale(uint _priceScaleIndex, uint16 _newPriceScale) external onlyOwner {
        _updatePriceScale(_priceScaleIndex, _newPriceScale);
    }

    function updateMinFee(uint64 _minFee) external onlyOwner {
        _updateMinFee(_minFee);
    }

    function updatePartRarity(uint _secIndex, uint _partIndex, uint8 _rarity) external onlyOwner {
        _updatePartRarity(_secIndex, _partIndex, _rarity);
    }

    function updateCoinAddr(address _coinAddr) external onlyOwner {
        coinAddr = _coinAddr;
    }

    function createAnt(uint104 _rawDna) external payable {
        require(COUNTER < 60000, "Ant limit reached!");
        uint[15] memory dna = _createDna(_rawDna);
        uint price = _getDnaPrice(dna, 0);
        require(msg.value >= price, "Not enough ETH!");
        _createAnt(_rawDna, msg.sender);
        _incrementCounts(dna);
    }

    function createDiscountAnt(uint16 _coinId, uint104 _rawDna) external payable {
        require(COUNTER < 60000, "Ant limit reached!");
        require(ICoins(coinAddr).ownerOf(_coinId) == msg.sender, "You don't own that coin!");
        require(!isDiscountUsedByID[_coinId], "Discount already used!");
        uint[15] memory dna = _createDna(_rawDna);
        uint color = ICoins(coinAddr).getColor(_coinId);
        uint price = _getDnaPrice(dna, color + 1);
        require(msg.value >= price, "Not enough ETH!");
        _createAnt(_rawDna, msg.sender);
        _incrementCounts(dna);
        isDiscountUsedByID[_coinId] = true;
    }

    function createPromotionalAnt(address _recipient, uint104 _rawDna) external onlyOwner {
        uint[15] memory dna = _createDna(_rawDna);
        _getDnaPrice(dna, 0);
        _createAnt(_rawDna, _recipient);
        _incrementCounts(dna);
    }

    function getDiscountDnaPrice(uint _coinColor, uint _rawDna) external view returns (uint price) {
        require(_coinColor < 5, "Color index out of bounds!");
        uint[15] memory dna = _createDna(_rawDna);
        price = _getDnaPrice(dna, _coinColor + 1);
    }

    function getDnaPrice(uint _rawDna) external view returns (uint price) {
        uint[15] memory dna = _createDna(_rawDna);
        price = _getDnaPrice(dna, 0);
    }

    function getAnt(uint _id) external view returns (uint[15] memory dna, uint[15] memory rarities) {
        dna = _createDna(ants[_id]);
        rarities = _getRarities(dna);
    }
}
