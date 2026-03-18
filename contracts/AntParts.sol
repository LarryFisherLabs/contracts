// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract AntParts {
    uint8[40][18] partRarities;
    uint8[40][18] partCounts;
    uint8[18] layerCount = [3, 40, 14, 14, 12, 5, 9, 4, 39, 4, 34, 7, 10, 24, 22, 5, 25, 4];
    uint8[6] maxStockByRarity = [200, 84, 36, 18, 9, 3];
    uint16[8] priceScaleByRarity = [3, 5, 12, 24, 150, 360, 1050, 1600];

    constructor() {
        partRarities[0] = [0,1,3];
        partRarities[1] = [0,0,0,0,0,0,1,1,2,2,2,2,3,3,3,3,3,4,4,4,4,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,7,7,7,8];
        partRarities[2] = [0,1,1,2,2,2,3,3,4,4,4,6,7,8];
        partRarities[3] = [0,1,1,2,2,3,3,4,4,5,5,6,7,7];
        partRarities[4] = [0,0,1,1,2,2,2,3,4,4,4,5];
        partRarities[5] = [0,2,3,4,5];
        partRarities[6] = [0,0,0,1,2,2,3,4,6];
        partRarities[7] = [0,0,1,2];
        partRarities[8] = [0,0,1,1,1,1,2,2,2,2,3,3,3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,5,6,6,6,6,6,6,7,7,7,7,7];
        partRarities[9] = [0,3,4,5];
        partRarities[10] = [0,0,0,1,1,1,2,2,2,3,3,3,3,4,4,4,4,4,5,5,5,6,6,6,6,6,6,6,6,6,7,7,7,8];
        partRarities[11] = [0,0,1,2,3,4,5];
        partRarities[12] = [0,1,1,2,4,5,5,5,5,5];
        partRarities[13] = [0,0,0,1,1,2,2,3,3,4,4,5,5,5,5,5,6,6,6,7,7,7,7,8];
        partRarities[14] = [0,0,1,1,1,2,2,2,3,3,3,3,3,4,4,4,5,6,7,7,7,8];
        partRarities[15] = [0,3,3,4,4];
        partRarities[16] = [0,1,1,1,1,2,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,6,6,6,6];
        partRarities[17] = [0,3,4,6];
    }

    function _getDnaPrice(uint[18] memory _dna, uint _discountIndex) internal view returns (uint price) {
        uint traitPoints;
        uint minPartFee = .0003 ether;
        for (uint i; i < 18; ++i) {
            require(_dna[i] < layerCount[i], "Invalid DNA!");
            uint partRarity = partRarities[i][_dna[i]];
            if (partRarity == 0) continue;
            if (partRarity > 2) {
                require((maxStockByRarity[partRarity - 3] - partCounts[i][_dna[i]]) > 0, "Part is sold out!");
                if (partRarity == 5) ++traitPoints;
                else if (5 < partRarity) traitPoints += (partRarity - 3);
            }
            price += (minPartFee * priceScaleByRarity[partRarity - 1]);
        }
        uint limit;
        if (_discountIndex < 3) limit = 110;
        else if (_discountIndex < 5) limit = 108 + _discountIndex;
        else limit = 115;
        require((limit - traitPoints) > 100, "Too many of top 4 rarities!");
        price += (minPartFee * 33);
        if (0 < _discountIndex) price = price * ((_discountIndex < 5) ? (100 - 10 * _discountIndex) : 20) / 100;
    }

    function getPartInventory(uint _secIndex, uint _partIndex) external view returns (uint inStock) {
        uint rarity = partRarities[_secIndex][_partIndex];
        if (rarity > 2) inStock = maxStockByRarity[rarity - 3] - partCounts[_secIndex][_partIndex];
        else inStock = 10000;
    }
}