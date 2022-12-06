const { assertCounter, assertAnt, assertPrices, assertIsDiscountUsed, assertPrice } = require("./ants-asserts");

const maxIndexByRarity = [10000, 3000, 1000, 300, 80, 3];
const priceScaleByRarity = [1, 2, 3, 8, 15, 2500];

let partRarities = [];
partRarities[0] = [0, 3, 4, 1, 3, 3, 4, 1, 1, 2, 2, 3, 2, 2, 2];
partRarities[1] = [0, 1, 3, 4, 2];
partRarities[2] = [0, 3, 4];
partRarities[3] = [0, 3, 4];
partRarities[4] = [0, 2, 3];
partRarities[5] = [0, 3];
partRarities[6] = [3, 3, 0];
partRarities[7] = [4, 4, 4, 0, 3, 4, 4, 2, 2, 1, 2, 2];
partRarities[8] = [0, 3, 3, 3];
partRarities[9] = [4, 2, 3, 3, 0, 0, 4, 1, 1, 3, 3, 3, 3];
partRarities[10] = [4, 0];
partRarities[11] = [4, 0];
partRarities[12] = [0, 4, 2, 3, 4, 3, 4, 3, 3, 3, 4];
partRarities[13] = [0, 3, 4, 3, 3, 3, 4, 3, 4, 3, 3, 3, 3, 3, 3, 4];
partRarities[14] = [4, 3, 0];


const _incrementAntDna = (_lastAntDna) => {
    for (let i = 14; i > 0; i--) {
        if (_lastAntDna[i] < partRarities[i].length - 1) {
            _lastAntDna[i]++;
            i = 0;
        }
        else {
            _lastAntDna[i] = 0;
            if (i === 1) {
                _lastAntDna[0]++
            }
        }
    }
    return _lastAntDna;
}

const incrementAntDna = (_isLegal, _lastAntDna) => {
    let isComplete = false;
    while (!isComplete) {
        _lastAntDna = _incrementAntDna(_lastAntDna);
        if (_isLegal) {
            if (_lastAntDna[3] == 2){
                if (_lastAntDna[0] !== 2 && _lastAntDna[1] === 0 && _lastAntDna[2] === 0 && _lastAntDna[4] === 0) {
                    isComplete = true;
                }
            }
            if (_lastAntDna[0] === 2 || _lastAntDna[9] === 0) {
                if (_lastAntDna[0] === 2 && _lastAntDna[9] === 0) {
                    // do nothing, if already true stay true same for false
                } else {
                    isComplete = false;
                }
            }
        } else {
            if (_lastAntDna[3] == 2){
                if (_lastAntDna[0] === 2 || _lastAntDna[1] !== 0 || _lastAntDna[2] !== 0 || _lastAntDna[4] !== 0) {
                    isComplete = true;
                }
            }
            if (_lastAntDna[0] === 2 || _lastAntDna[9] === 0) {
                if (_lastAntDna[0] !== 2 || _lastAntDna[9] !== 0) {
                   isComplete = true;
                }
            }
        }
    }
    return _lastAntDna;
}

// update base uri
// update max stock
// update price scale
// update min fee
// update part rarity
// update coin address
// withdraw

const createAnt = async (_antsInstance, _sendingAccount, _sendingValue, _dna, _rarities, _count) => {
    await assertCounter(_antsInstance, _count);
    await assertPrices(_antsInstance, _dna, _sendingValue);
    await _antsInstance.createAnt(_dna, { from: _sendingAccount, value: _sendingValue });
    await assertCounter(_antsInstance, _count + 1);
    await assertAnt(_antsInstance, _count, _dna, _rarities, _sendingAccount);
}

const createDiscountAnt = async (_antsInstance, _sendingAccount, _sendingValue, _dna, _rarities, _count, _coinId, _coinColor) => {
    await assertCounter(_antsInstance, _count);
    await assertPrice(_antsInstance, _dna, _sendingValue);
    await assertIsDiscountUsed(_antsInstance, _coinId, false);
    await _antsInstance.createDiscountAnt(_coinId, _dna, { from: _sendingAccount, value: _sendingValue });
}
// create ant
// create X ants
// create promotional ant

module.exports = {
    incrementAntDna,
    createAnt,
    createDiscountAnt,
};