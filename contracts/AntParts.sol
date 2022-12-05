// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract AntParts {

    uint8[][15] partRarities;
    uint16[][15] partCounts;
    uint16[6] maxStockByRarity;
    uint16[6] priceScaleByRarity;
    uint64 minPartFee = .0009 ether;

    constructor() {
        partRarities[0] = [0, 3, 4, 1, 3, 3, 4, 1, 1, 2, 2, 3, 2, 2, 2];
        partCounts[0] = new uint8[](15);
        partRarities[1] = [0, 1, 3, 4, 2];
        partCounts[1] = new uint8[](5);
        partRarities[2] = [0, 3, 4];
        partCounts[2] = new uint8[](3);
        partRarities[3] = [0, 3, 4];
        partCounts[3] = new uint8[](3);
        partRarities[4] = [0, 2, 3];
        partCounts[4] = new uint8[](3);
        partRarities[5] = [0, 3];
        partCounts[5] = new uint8[](2);
        partRarities[6] = [3, 3, 0];
        partCounts[6] = new uint8[](3);
        partRarities[7] = [4, 4, 4, 0, 3, 4, 4, 2, 2, 1, 2, 2];
        partCounts[7] = new uint8[](12);
        partRarities[8] = [0, 3, 3, 3];
        partCounts[8] = new uint8[](4);
        partRarities[9] = [4, 2, 3, 3, 0, 0, 4, 1, 1, 3, 3, 3, 3];
        partCounts[9] = new uint8[](13);
        partRarities[10] = [4, 0];
        partCounts[10] = new uint8[](2);
        partRarities[11] = [4, 0];
        partCounts[11] = new uint8[](2);
        partRarities[12] = [0, 4, 2, 3, 4, 3, 4, 3, 3, 3, 4];
        partCounts[12] = new uint8[](11);
        partRarities[13] = [0, 3, 4, 3, 3, 3, 4, 3, 4, 3, 3, 3, 3, 3, 3, 4];
        partCounts[13] = new uint8[](16);
        partRarities[14] = [4, 3, 0];
        partCounts[14] = new uint8[](3);
        maxStockByRarity = [10000, 3000, 1000, 300, 80, 3];
        priceScaleByRarity = [1, 2, 3, 8, 15, 2500];
    }

    function _updateMaxStock(uint _maxStockIndex, uint16 _newMaxStock) internal {
        maxStockByRarity[_maxStockIndex] = _newMaxStock;
    }

    function _updatePriceScale(uint _priceScaleIndex, uint16 _newPriceScale) internal {
        priceScaleByRarity[_priceScaleIndex] = _newPriceScale;
    }

    function _updateMinFee(uint64 _minFee) internal {
        minPartFee = _minFee;
    }

    function _updatePartRarity(uint _secIndex, uint _partIndex, uint8 _rarity) internal {
        partRarities[_secIndex][_partIndex] = _rarity;
    }

    function _getRarities(uint[15] memory _dna) internal view returns (uint[15] memory rarities) {
        for (uint i; i < 15; ++i) {
            rarities[i] = partRarities[i][_dna[i]];
        }
    }

    function _getDnaPrice(uint[15] memory _dna, uint _discountIndex) internal view returns (uint price) {
        if (_dna[3] == 2) {
            require(_dna[0] != 2, "EOD and gas masks incompatible!");
            require(_dna[1] == 0, "Gas mask incompatible with optical!");
            require(_dna[2] == 0, "Gas mask incompatible with mouth!");
            require(_dna[4] == 0, "Gas mask incompatible with face!");

        }
        if (_dna[0] == 2 || _dna[9] == 0) {
            require(_dna[0] == 2, "EOD must be paired!");
            require(_dna[9] == 0, "EOD must be paired!");
        }
        for (uint i; i < 15; ++i) {
            require(_dna[i] < partCounts[i].length, "Invalid DNA!");
            uint partRarity = partRarities[i][_dna[i]];
            require((maxStockByRarity[partRarity] - partCounts[i][_dna[i]]) > 0, "Part is sold out!");
            if (_discountIndex == 0) {
                price += minPartFee * priceScaleByRarity[partRarity];
            } else {
                price += minPartFee * priceScaleByRarity[partRarity] * (100 - 10 * _discountIndex) / 100;
            }
        }
    }

    function _incrementCounts(uint[15] memory _dna) internal {
        for (uint i; i < 15; ++i) {
            partCounts[i][_dna[i]] = partCounts[i][_dna[i]] + 1;
        }
    }

    function getPartInventory(uint _secIndex, uint _partIndex) external view returns (uint inStock) {
        uint rarity = partRarities[_secIndex][_partIndex];
        inStock = maxStockByRarity[rarity] - partCounts[_secIndex][_partIndex];
    }

    function getRarityPrices(uint _discountIndex) external view returns (uint[6] memory prices) {
        require(_discountIndex < 6, "Discount index out of bounds!");
        uint minFee = minPartFee;
        uint16[6] memory priceScale = priceScaleByRarity;
        for (uint i; i < 6; ++i) {
            if (_discountIndex == 0) {
                prices[i] = priceScale[i] * minFee;
            } else {
                prices[i] = priceScale[i] * minFee * (100 - 10 * _discountIndex) / 100;
            }
        }
    }
}