const { toWei, fromWei } = require("../utils");

// 3 asserts
const addFounderUnauth = async (_coinsInstance, _accountToAdd, _sendingAccount) => {
    const isFounderBefore = await _coinsInstance.isOnFounderList(_accountToAdd);
    assert.equal(isFounderBefore, false, "shouldn't be founder");
    let errMsg = "";
    try {
        await _coinsInstance.addFounder(_accountToAdd, toWei("1"), { from: _sendingAccount });
    } catch (err) {
        if (err.reason) {
            errMsg = err.reason;
        } else {
            throw err;
        }
    }
    assert.equal(errMsg, "Ownable: caller is not the owner", "missing error");
    const isFounderAfter = await _coinsInstance.isOnFounderList(_accountToAdd);
    assert.equal(isFounderAfter, false, "shouldn't be founder");
}

// 3 asserts
const addExistingFounder = async (_coinsInstance, _accountToAdd, _sendingAccount) => {
    const isFounder = await _coinsInstance.isOnFounderList(_accountToAdd);
    assert.equal(isFounder, true, "Should be founder!");
    let errMsg = "";
    try {
        await _coinsInstance.addFounder(_accountToAdd, toWei("1"), { from: _sendingAccount });
    } catch (err) {
        if (err.reason) {
            errMsg = err.reason;
        } else {
            throw err;
        }
    }
    assert.equal(errMsg, "Already set!", "missing error");
    const isFounderAfter = await _coinsInstance.isOnFounderList(_accountToAdd);
    assert.equal(isFounderAfter, isFounder, "Shouldn't have changed!");
}

// 4 asserts
const addFounderWNoValue = async (_coinsInstance, _accountToAdd, _valueToAdd, _sendingAccount) => {
    const isFounder = await _coinsInstance.isOnFounderList(_accountToAdd);
    const rawVal = fromWei(_valueToAdd.toString()) * 100000;
    assert.isBelow(rawVal, 10, "Too much value to fail!");
    assert.equal(isFounder, false, "Shouldn't be founder!");
    let errMsg = "";
    try {
        await _coinsInstance.addFounder(_accountToAdd, _valueToAdd, { from: _sendingAccount });
    } catch (err) {
        if (err.reason) {
            errMsg = err.reason;
        } else {
            throw err;
        }
    }
    assert.equal(errMsg, "Founder must have a value!", "Missing error!");
    const isFounderAfter = await _coinsInstance.isOnFounderList(_accountToAdd);
    assert.equal(isFounderAfter, isFounder, "Shouldn't have changed!");
}

// 2 asserts
const founderBadBuyCoinOrder = async (_coinsInstance, _sendingAccount) => {
    let errMsg = "";
    try {
        await _coinsInstance.createCoin({ from: _sendingAccount, value: toWei("500") });
    } catch (err) {
        if (err.reason) {
            errMsg = err.reason;
        } else {
            throw err;
        }
    }
    assert.equal(errMsg, "Mint founder coin first!", "missing error");
    errMsg = "";
    try {
        await _coinsInstance.createExactCoin(0, { from: _sendingAccount, value: toWei("500") });
    } catch (err) {
        if (err.reason) {
            errMsg = err.reason;
        } else {
            throw err;
        }
    }
    assert.equal(errMsg, "Mint founder coin first!", "missing error");
}

// 1 assert
const founderBadBuyFCAlreadyOwner = async (_coinsInstance, _sendingAccount) => {
    let errMsg = "";
    try {
        await _coinsInstance.createFounderCoin({ from: _sendingAccount });
    } catch (err) {
        if (err.reason) {
            errMsg = err.reason;
        } else {
            throw err;
        }
    }
    assert.equal(errMsg, "Already Minted!", "missing error");
}

// 1 assert
const nonFounderBadBuyFC = async (_coinsInstance, _sendingAccount) => {
    let errMsg = "";
    try {
        await _coinsInstance.createFounderCoin({ from: _sendingAccount });
    } catch (err) {
        if (err.reason) {
            errMsg = err.reason;
        } else {
            throw err;
        }
    }
    assert.equal(errMsg, "Founders only!", "missing error");
}

// 1-2 asserts
const badBuySkimp = async (_coinsInstance, _sendingAccount, _sendingValue, _color = 0) => {
    let assertCount = 0;
    let errMsg = "";
    if (_color === 0) {
        try {
            await _coinsInstance.createCoin({ from: _sendingAccount, value: _sendingValue });
        } catch (err) {
            if (err.reason) {
                errMsg = err.reason;
            } else {
                throw err;
            }
        }
        assert.equal(errMsg, "Not enough Eth!", "missing error");
        assertCount++;
        errMsg = "";
    }
    try {
        await _coinsInstance.createExactCoin(_color, { from: _sendingAccount, value: _sendingValue });
    } catch (err) {
        if (err.reason) {
            errMsg = err.reason;
        } else {
            throw err;
        }
    }
    assert.equal(errMsg, "Not enough eth!", "missing error");
    assertCount++;
    const count = _color === 0 ? 2 : 1;
    assert.equal(assertCount, count, "Wrong assert count!");
}

// 1 assert
const _badExactBuyBadIndex = async (_coinsInstance, _sendingAccount, _colorIndex) => {
    let errMsg = "";
    try {
        await _coinsInstance.createExactCoin(_colorIndex, { from: _sendingAccount, value: toWei("500") });
    } catch (err) {
        if (err.reason) {
            errMsg = err.reason;
        } else {
            throw err;
        }
    }
    assert.equal(errMsg, "Color out of bounds!", "missing error");
}

// 3 asserts
const badExactBuyBadIndexes = async (_coinsInstance, _sendingAccount) => {
    await _badExactBuyBadIndex(_coinsInstance, _sendingAccount, 4);
    await _badExactBuyBadIndex(_coinsInstance, _sendingAccount, 5);
    await _badExactBuyBadIndex(_coinsInstance, _sendingAccount, 10);
}

module.exports = {
    addFounderUnauth,
    addExistingFounder,
    addFounderWNoValue,
    founderBadBuyCoinOrder,
    founderBadBuyFCAlreadyOwner,
    nonFounderBadBuyFC,
    badBuySkimp,
    badExactBuyBadIndexes,
};