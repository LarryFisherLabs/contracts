// SPDX-License-Identifier: GPL-3.0

// ###########################################################
// !!! UPDATE BASE_URI AND ERC721 NAME/SYMBOL ON MIGRATION !!!
// ###########################################################
// sepolia: 11155111
// goerli: 5

pragma solidity ^0.8.0;

import "./AntParts.sol";
import "./custom-erc721/ERC721J.sol";

string constant BASE_URI = "https://nft-api-bphk.onrender.com/ants/{netId}/{versionId}/";

interface ICoins {
    function getCoin(uint) external view returns (uint, uint);
    function ownerOf(uint) external view returns (address);
}

contract Ants is ERC721J, AntParts {
    uint public COUNTER;
    uint public nameFee = .0025 ether;
    address public coinAddr;
    address public commander;

    constructor(address _coinAddr, address denyListAddress_) ERC721J("Army Ants 0.0", "AA00", BASE_URI, denyListAddress_) {
        coinAddr = _coinAddr;
        commander = msg.sender;
    }

    uint120[] antDnas;
    mapping(uint => bytes) antNames;
    mapping(uint => uint) antStates;
    mapping(uint => bool) isDiscountUsedByID;
    mapping(address => uint) promotionalAnts;

    event NewAnt(address indexed owner, uint antId);
    event DnaChange(uint antId, uint dna);

    function _beforeTokenTransfer(address, address, uint tokenId) internal virtual override {
        uint state = antStates[tokenId];
        require(((state >> 48) < 10) && ((uint48(state) + 48 hours) < block.timestamp));
        // require((state >> 48) < 10), "Ant is rented!");
        // require((uint48(state) + 48 hours) < block.timestamp, "Ant state changed too recently!");
    }

    function _createRawDna(uint[18] memory _dna) private pure returns (uint resultDna) {
        for (uint i; i < 18; ++i) resultDna = resultDna * 100 + _dna[i];
    }

    function _createAnt(uint _rawDna, address _recipient) private {
        _mint(_recipient, COUNTER);
        emit NewAnt(_recipient, COUNTER);
        antDnas.push(uint120(_rawDna));
        COUNTER++;
    }

    function withdraw() external payable onlyOwner {
        address payable _owner = payable(owner());
        _owner.transfer(address(this).balance);
    }

    function updateCoinAddr(address _coinAddr) external onlyOwner {
        coinAddr = _coinAddr;
    }

    function updateCommander(address _commander) external onlyOwner {
        commander = _commander;
    }

    function addPromotionalAnt(uint[18] memory _dna, address _recipient, bool _isAirDrop) external onlyOwner {
        if (_isAirDrop) _createAnt(_createRawDna(_dna), _recipient);
        else promotionalAnts[_recipient] = _createRawDna(_dna);
        for (uint i; i < 18; ++i) if (partRarities[i][_dna[i]] > 2) partCounts[i][_dna[i]]++;
    }

    function commanderTransfer(address _from, address _to, uint _tokenId) external {
        // require(msg.sender == commander, "Commander only!");
        uint state = antStates[_tokenId];
        require((msg.sender == commander) && (((state >> 48) % 10) == 1) && ((uint48(state) + 1 hours) < block.timestamp));
        // require(((state >> 48) % 10) == 1, "Ant owner must unlock!");
        // require((uint48(state) + 1 hours) < block.timestamp, "Ant state changed too recently!");
        _simpleTransfer(_from, _to, _tokenId);
    }

    function toggleRental (uint _antId, bool _isRented, address _antOwner) external {
        // require(msg.sender == commander, "Commander only!");
        uint state = antStates[_antId];
        uint bools = state >> 48;
        // require((bools % 10) == 1, "Ant owner must unlock!");
        require((msg.sender == commander) && ((bools % 10) == 1) && (ownerOf(_antId) == _antOwner));
        if (bools > 9 && !_isRented) {
            bools -= 10;
            antStates[_antId] = (bools << 48) + uint48(state);
        }
        else if (bools < 10 && _isRented) {
            require(((uint48(state) + 1 hours) < block.timestamp));
            bools += 10;
            antStates[_antId] = (bools << 48) + uint48(block.timestamp);
        }
    }

    function changeDna(address _sender, uint _antId, uint _coolDownDuration, uint _newRawDna) external {
        // require(msg.sender == commander, "Commander only!");
        uint state = antStates[_antId];
        uint bools = state >> 48;
        // require((bools % 10) == 1, "Ant owner must unlock!");
        // require(_sender == ownerOf(_antId), "Not owner!");
        // require(bools < 10, "Cannot change DNA while ant is rented out!");
        // require((uint48(state) + _coolDownDuration) < block.timestamp, "Ant state changed too recently!");
        require((msg.sender == commander) && ((bools % 10) == 1) && (_sender == ownerOf(_antId)) && (bools < 10) && ((uint48(state) + _coolDownDuration) < block.timestamp));
        antStates[_antId] = (bools << 48) + uint48(block.timestamp);
        delete _tokenApprovals[_antId]; // Clear stale marketplace approvals when DNA changes
        antDnas[_antId] = uint120(_newRawDna);
        emit DnaChange(_antId, _newRawDna);
    }

    function changeName(uint _id, bytes memory _newName) external payable {
        // require(msg.sender == ownerOf(_id), "Must be owner of ant!");
        // require(_newName.length > 0, "Name cannot be blank!");
        require((msg.sender == ownerOf(_id)) && (_newName.length > 0));
        if (antNames[_id].length > 0) require(msg.value >= nameFee);
        antNames[_id] = _newName;
    }

    function createAnt(uint[18] memory _dna) external payable {
        // require(COUNTER < 10000, "Ant limit reached!");
        // require(msg.value >= _getDnaPrice(_dna, 0), "Not enough ETH!");
        require((COUNTER < 10000) && (msg.value >= _getDnaPrice(_dna, 0)));
        _createAnt(_createRawDna(_dna), msg.sender);
        for (uint i; i < 18; ++i) if (partRarities[i][_dna[i]] > 2) partCounts[i][_dna[i]]++;
    }

    function createDiscountAnt(uint _coinId, uint[18] memory _dna) external payable {
        // require(COUNTER < 11000, "Ant limit reached!");
        // require(isDiscountUsedByID[_coinId] == false, "Discount already used!");
        require((COUNTER < 11000) && (isDiscountUsedByID[_coinId] == false));
        isDiscountUsedByID[_coinId] = true;
        require(ICoins(coinAddr).ownerOf(_coinId) == msg.sender);
        (, uint color) = ICoins(coinAddr).getCoin(_coinId);
        require(_getDnaPrice(_dna, color + 1) <= msg.value);
        _createAnt(_createRawDna(_dna), msg.sender);
        for (uint i; i < 18; ++i) if (partRarities[i][_dna[i]] > 2) partCounts[i][_dna[i]]++;
    }

    function createPromotionalAnt() external {
        uint antDna = promotionalAnts[msg.sender];
        require(antDna != 0);
        // require(antDna != 0, "No promotional ant available!");
        promotionalAnts[msg.sender] = 0;
        _createAnt(uint120(antDna), msg.sender);
    }

    function toggleAntLock(uint _antId) external {
        // require(msg.sender == ownerOf(_antId), "Only ant owner!");
        require(msg.sender == ownerOf(_antId));
        uint state = antStates[_antId];
        uint bools = state >> 48;
        if ((bools % 10) == 1) --bools;
        else if ((bools % 10) == 0) ++bools;
        antStates[_antId] = (bools << 48) + uint48(state);
    }

    function isDiscountUsedByCoin(uint _id) external view returns (bool) {
        return isDiscountUsedByID[_id];
    }

    function getAnt(uint _antId) external view returns (uint[18] memory dna, uint[18] memory rarities, bytes memory antName, bool isUnlocked, bool isRentLocked) {
        uint rawDna = antDnas[_antId];
        for (uint i; i < 18; ++i) dna[i] = rawDna / 100 ** (17 - i) % 100;
        for (uint i; i < 18; ++i) rarities[i] = partRarities[i][dna[i]];
        antName = antNames[_antId];
        uint bools = antStates[_antId] >> 48;
        isUnlocked = ((bools % 10) == 1);
        isRentLocked = ((bools / 10) == 1);
    }
}
