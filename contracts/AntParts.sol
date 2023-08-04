// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract AntParts {

    uint8[][17] partRarities;
    uint16[][17] partCounts;
    uint16[4] maxStockByRarity;
    uint16[6] priceScaleByRarity;
    uint64 minPartFee = .0009 ether;

    constructor() {
        partRarities[0] = [0, 3, 4, 1, 3, 3, 4, 1, 1, 2, 2, 3, 2, 2, 2, 5, 5, 5, 5];
        partCounts[0] = new uint8[](19);
        partRarities[1] = [0, 1, 3, 4, 2, 5, 5, 5];
        partCounts[1] = new uint8[](8);
        partRarities[2] = [0, 3, 4, 5, 5];
        partCounts[2] = new uint8[](5);
        partRarities[3] = [0, 3, 4, 5, 6];
        partCounts[3] = new uint8[](5);
        partRarities[4] = [0, 2, 3];
        partCounts[4] = new uint8[](3);
        partRarities[5] = [0, 3, 5];
        partCounts[5] = new uint8[](3);
        partRarities[6] = [4, 3, 0];
        partCounts[6] = new uint8[](3);
        partRarities[7] = [4, 4, 4, 0, 1, 4, 4, 3, 3, 1, 3, 2, 5, 6, 6, 6];
        partCounts[7] = new uint8[](16);
        partRarities[8] = [0, 4, 3, 2];
        partCounts[8] = new uint8[](4);
        partRarities[9] = [4, 2, 3, 3, 0, 0, 4, 1, 1, 3, 3, 3, 3, 5, 6, 6, 6];
        partCounts[9] = new uint8[](17);
        partRarities[10] = [4, 0];
        partCounts[10] = new uint8[](2);
        partRarities[11] = [4, 0];
        partCounts[11] = new uint8[](2);
        partRarities[12] = [0, 4, 2, 3, 4, 3, 4, 3, 3, 3, 4, 5, 6, 6, 6];
        partCounts[12] = new uint8[](15);
        partRarities[13] = [0, 3, 4, 3, 3, 3, 4, 3, 4, 3, 3, 3, 3, 3, 3, 4];
        partCounts[13] = new uint8[](16);
        partRarities[14] = [4, 3, 0, 5];
        partCounts[14] = new uint8[](4);
        partRarities[15] = [0, 5, 5, 5];
        partCounts[15] = new uint8[](4);
        partRarities[16] = [0, 5];
        partCounts[16] = new uint8[](2);
        maxStockByRarity = [420, 42, 7, 2];
        priceScaleByRarity = [1, 2, 6, 18, 100, 1000];
    }

    function _getRarities(uint[17] memory _dna) internal view returns (uint[17] memory rarities) {
        for (uint i; i < 17; ++i) {
            rarities[i] = partRarities[i][_dna[i]];
        }
    }

    function _getDnaPrice(uint[17] memory _dna, uint _discountIndex) internal view returns (uint price) {
        if (_dna[3] == 2 || _dna[3] == 4) {
            require(_dna[0] != 2, "EOD and gas masks incompatible!");
            require(_dna[1] == 0, "Gas mask incompatible with optical!");
            require(_dna[2] == 0, "Gas mask incompatible with mouth!");
            require(_dna[4] == 0, "Gas mask incompatible with face!");

        }
        if (_dna[0] == 2 || _dna[9] == 0) {
            require(_dna[0] == 2, "EOD must be paired!");
            require(_dna[9] == 0, "EOD must be paired!");
            require(_dna[5] == 0, "EOD and shemagh incomaptible!");
            require(_dna[2] == 0, "EOD and mouth incomaptible!");
            require(_dna[8] == 0, "EOD and bandolier incomaptible!");
        }
        uint epicCount = 0;
        uint legendaryCount = 0;
        for (uint i; i < 17; ++i) {
            require(_dna[i] < partCounts[i].length, "Invalid DNA!");
            uint partRarity = partRarities[i][_dna[i]];
            if (partRarity == 0) {
                continue;
            }
            if (partRarity > 2 ) {
                require((maxStockByRarity[partRarity - 3] - partCounts[i][_dna[i]]) > 0, "Part is sold out!");
                if (partRarity > 4) {
                    if (partRarity > 5) {
                        legendaryCount++;
                        epicCount++;
                    } else {
                        epicCount++;
                    }
                }
            }
            uint partPrice = minPartFee * priceScaleByRarity[partRarity - 1];
            if (_discountIndex > 0) {
                partPrice = partPrice * (100 - 10 * _discountIndex) / 100;
            }
            price += partPrice;
        }
        require(epicCount < 3, "2 epic or greater traits max!");
        require(legendaryCount < 2, "1 legendary trait max!");
        uint basePrice = minPartFee * 11;
        if (_discountIndex > 0) {
            basePrice = basePrice * (100 - 10 * _discountIndex) / 100;
        }
        price += basePrice;
    }

    function _incrementCounts(uint[17] memory _dna) internal {
        for (uint i; i < 17; ++i) {
            if (partRarities[i][_dna[i]] > 2) {
                partCounts[i][_dna[i]]++;
            }
        }
    }

    function getPartInventory(uint _secIndex, uint _partIndex) external view returns (uint inStock) {
        uint rarity = partRarities[_secIndex][_partIndex];
        if (rarity > 2) {
            inStock = maxStockByRarity[rarity - 3] - partCounts[_secIndex][_partIndex];
        } else {
            inStock = 10000;
        }
    }

    function getRarityPrices(uint _discountIndex) external view returns (uint[6] memory prices) {
        require(_discountIndex < 6, "Discount index out of bounds!");
        uint minFee = minPartFee;
        uint16[6] memory priceScale = priceScaleByRarity;
        for (uint i; i < 6; ++i) {
            prices[i] = priceScale[i] * minFee * (100 - 10 * _discountIndex) / 100;
        }
    }
}