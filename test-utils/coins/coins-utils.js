const { fromWei, toWei, getBalance } = require("../utils");
const { assertCoin, assertCounters, assertFounder, assertFounderBools, assertPrices } = require("./coins-asserts");
const { badBuySkimp } = require("./coins-reversion");

// 5 asserts
const addFounder = async (_coinsInstance, _accountToAdd, _amountToAdd, _sendingAccount) => {
    const isFounderBefore = await _coinsInstance.isOnFounderList(_accountToAdd);
    assert.equal(isFounderBefore, false, "shouldn't be founder");
    await _coinsInstance.addFounder(_accountToAdd, _amountToAdd, { from: _sendingAccount });
    const isFounderAfter = await _coinsInstance.isOnFounderList(_accountToAdd);
    assert.equal(isFounderAfter, true, "should be founder");
    await assertFounder(_coinsInstance, _accountToAdd, _amountToAdd, false, false);
}

// 4 asserts
const buyFounderCoin = async (_coinsInstance, _sendingAccount, _founderValue, _sendingValue = 0, _totalValue = _founderValue) => {
    // const balanceBefore = await getBalance(_sendingAccount);
    const counters = await _coinsInstance.getCounters();
    await assertFounder(_coinsInstance, _sendingAccount, _founderValue, false, false);
    await _coinsInstance.createFounderCoin({ from: _sendingAccount, value: _sendingValue });
    await assertFounder(_coinsInstance, _sendingAccount, _founderValue, true, false);
    await assertCounters(_coinsInstance, counters[0].toNumber() + 1, counters[1].toNumber(), counters[2].toNumber(), counters[3].toNumber(), counters[4].toNumber());
    await assertCoin(_coinsInstance, counters[0].toNumber(), _totalValue, 4, _sendingAccount);
    // const balanceAfter = await getBalance(_sendingAccount);
    // const gasFee = balanceAfter + fromWei(_totalValue) - balanceBefore;
    // console.log("Founder coin bought, gas fee: " + gasFee);
}

// 2-4 asserts
const buyCoinAllAsserts = async (_coinsInstance, _sendingAccount, _sendingValue, _id, _color, _isDiscounted, _isExact) => {
    // const balanceBefore = await getBalance(_sendingAccount);
    const counters = await _coinsInstance.getCounters();
    if (_isDiscounted) {
        await assertFounderBools(_coinsInstance, _sendingAccount, true, false);
    }
    if (_isExact) {
        await _coinsInstance.createExactCoin(_color, { from: _sendingAccount, value: _sendingValue });
    } else {
        await _coinsInstance.createCoin({ from: _sendingAccount, value: _sendingValue });
    }
    if (_isDiscounted) {
        await assertFounderBools(_coinsInstance, _sendingAccount, true, true);
        _sendingValue = fromWei(_sendingValue) * 2;
        _sendingValue = toWei(_sendingValue);
    }
    for (let i = 0; i < 5; i++) {
        if (i === 0 || i === _color + 1) {
            counters[i] = counters[i].toNumber() + 1;
        } else {
            counters[i] = counters[i].toNumber();
        }
    }
    await assertCoin(_coinsInstance, _id, _sendingValue, _color, _sendingAccount);
    await assertCounters(_coinsInstance, counters[0], counters[1], counters[2], counters[3], counters[4]);
    // const balanceAfter = await getBalance(_sendingAccount);
    // const gasFee = balanceAfter + fromWei(_sendingValue) - balanceBefore;
    // console.log("Coin bought, gas fee: " + gasFee);
}

const buyCoinNoAsserts = async (_coinsInstance, _sendingAccount, _sendingValue, _color, _isExact) => {
    if (_isExact) {
        await _coinsInstance.createExactCoin(_color, { from: _sendingAccount, value: _sendingValue });
    } else {
        await _coinsInstance.createCoin({ from: _sendingAccount, value: _sendingValue });
    }
}

const logContractState = (_stepName, _prices, _counts, _balance) => {
    console.log(
        _stepName + ":\n" +
        "   Prices:\n" +
        "       Bronze: " + _prices[0] / 1000 + " Eth\n" +
        "       Silver: " + _prices[1] / 1000 + " Eth\n" +
        "       Gold: " + _prices[2] / 1000 + " Eth\n" +
        "       Diamond: " + _prices[3] / 1000 + " Eth\n" +
        "   Counts:\n" +
        "       Total: " + _counts[0] + "\n" +
        "       Bronze: " + _counts[1] + "\n" +
        "       Silver: " + _counts[2] + "\n" +
        "       Gold: " + _counts[3] + "\n" +
        "       Diamond: " + _counts[4] + "\n" +
        "   Contract Balance: " + _balance + " Eth");
}

const buyXCoinsWAssertsEvenDistr = async (_coinsInstance, _X, _prices, _counts, _accounts) => {
    for (let i = 0; i < _X; i++) {
        const color = i % 4;
        const accIndex = i % 8;
        const goodVal = _prices[color] / 1000;
        // use is exact of every five cycles
        const isExact = (i % 5) === 1 ? true : false;
        await buyCoinAllAsserts(_coinsInstance, _accounts[accIndex], toWei(goodVal), _counts[0], color, false, isExact);
        _counts[0]++;
        _counts[color + 1]++;
        if (_counts[0] % 10 === 0) {
            for (let j = 0; j < 4; j++) {
                _prices[j] = _prices[j] + 1;
            }
        }
        if (_counts[color + 1] % 5 === 0) {
            _prices[color] = _prices[color] + color + 1;
        }
        if (i % 10 === 1) {
            const badVal = (_prices[color] * 10 - 1) / 10000;
            await badBuySkimp(_coinsInstance, _accounts[accIndex], toWei(badVal), color);
        }
        await assertCounters(_coinsInstance, _counts[0], _counts[1], _counts[2], _counts[3], _counts[4]);
        await assertPrices(_coinsInstance, false, toWei(_prices[0] / 1000), toWei(_prices[1] / 1000), toWei(_prices[2] / 1000), toWei(_prices[3] / 1000));
    }
    console.log("With asserts!");
    return {
        prices: _prices,
        counts: _counts,
    };
}

const buyXCoinsNoAssertsEvenDistr = async (_coinsInstance, _X, _prices, _counts, _accounts) => {
    for (let i = 0; i < _X; i++) {
        const color = i % 4;
        const accIndex = i % 8;
        const goodVal = _prices[color] / 1000;
        // use is exact of every five cycles
        const isExact = (i % 5) === 1 ? true : false;
        await buyCoinNoAsserts(_coinsInstance, _accounts[accIndex], toWei(goodVal), color, isExact);
        _counts[0]++;
        _counts[color + 1]++;
        if (_counts[0] % 10 === 0) {
            for (let j = 0; j < 4; j++) {
                _prices[j] = _prices[j] + 1;
            }
        }
        if (_counts[color + 1] % 5 === 0) {
            _prices[color] = _prices[color] + color + 1;
        }
    }
    await assertCounters(_coinsInstance, _counts[0], _counts[1], _counts[2], _counts[3], _counts[4]);
    await assertPrices(_coinsInstance, false, toWei(_prices[0] / 1000), toWei(_prices[1] / 1000), toWei(_prices[2] / 1000), toWei(_prices[3] / 1000));
    return {
        prices: _prices,
        counts: _counts,
    };
}

module.exports = {
    addFounder,
    buyFounderCoin,
    buyCoin: buyCoinAllAsserts,
    logContractState,
    buyXCoinsEvenDistr: buyXCoinsWAssertsEvenDistr,
    buyXCoinsNoAssertsEvenDistr,
};