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
const maxIndexByRarity = [10000, 3000, 1000, 300, 80];
const priceScaleByRarity = [1, 2, 3, 8, 15];

const antBuilder = (_isLegal, _isOriginal, _lastAntDna = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 10, 15, 2]) => {
    for (let i = 14; i > 0; i--) {
        if (_lastAntDna[i] < partRarities[i].length - 1) {
            _lastAntDna[i]++;
            i = 0;
        }
        else {
            _lastAntDna[i] = 0;
        }
        if (i === 0) {
            if (_isLegal) {
                if ((_lastAntDna[9] === 0 && _lastAntDna[0] !== 2) || (_lastAntDna[0] === 2 && _lastAntDna[9] !== 0)) {
                    i = 15;
                }
                if (_lastAntDna[3] === 2 && _lastAntDna[0] === 2) {
                    i = 15;
                }
                if (_lastAntDna[3] === 2 && _lastAntDna[1] !== 0) {
                    i = 15;
                }
                if (_lastAntDna[3] === 2 && _lastAntDna[2] !== 0) {
                    i = 15;
                }
                if (_lastAntDna[3] === 2 && _lastAntDna[4] !== 0) {
                    i = 15;
                }
            } else {
                if ((_lastAntDna[9] === 0 && _lastAntDna[0] !== 2) || (_lastAntDna[0] === 2 && _lastAntDna[9] !== 0)) {
                    i = 15;
                }
                if (_lastAntDna[3] === 2 && _lastAntDna[0] === 2) {
                    i = 15;
                }
                if (_lastAntDna[3] === 2 && _lastAntDna[1] !== 0) {
                    i = 15;
                }
                if (_lastAntDna[3] === 2 && _lastAntDna[2] !== 0) {
                    i = 15;
                }
                if (_lastAntDna[3] === 2 && _lastAntDna[4] !== 0) {
                    i = 15;
                }
            }
        }
    }
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
}