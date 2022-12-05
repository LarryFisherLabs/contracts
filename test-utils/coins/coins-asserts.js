// 2 asserts
const assertFounderBools = async (_coinsInstance, _account, _isFounderCoinMinted, _isDiscountUsed) => {
    const founder = await _coinsInstance.getFounder(_account);
    assert.equal(founder.isFounderCoinMinted, _isFounderCoinMinted, "Wrong bool!");
    assert.equal(founder.isDiscountUsed, _isDiscountUsed, "Wrong discount bool!");
}

// 3 asserts
const assertFounder = async (_coinsInstance, _account, _value, _isFounderCoinMinted, _isDiscountUsed) => {
    const founder = await _coinsInstance.getFounder(_account);
    assert.equal(founder[0], _value, "Wrong founder value!");
    assert.equal(founder[1], _isFounderCoinMinted, "Wrong bool!");
    assert.equal(founder[2], _isDiscountUsed, "Wrong discount bool!");
}

// 5 asserts
const assertCounters = async (_coinsInstance, _totalCount, _bronzeCount, _silverCount, _goldCount, _diamondCount) => {
    const counters = await _coinsInstance.getCounters();
    assert.equal(counters[0].toNumber(), _totalCount, "Wrong total count!");
    assert.equal(counters[1].toNumber(), _bronzeCount, "Wrong bronze count!");
    assert.equal(counters[2].toNumber(), _silverCount, "Wrong silver count!");
    assert.equal(counters[3].toNumber(), _goldCount, "Wrong gold count!");
    assert.equal(counters[4].toNumber(), _diamondCount, "Wrong diamond count!");
}

// 4 asserts
const assertCoin = async (_coinsInstance, _id, _value, _color, _owner) => {
    const coin = await _coinsInstance.getCoin(_id);
    const owner = await _coinsInstance.ownerOf(_id);
    const uri = await _coinsInstance.tokenURI(_id);
    assert.equal(coin[0], _value, "Wrong value!");
    assert.equal(coin[1], _color, "Wrong color!");
    assert.equal(owner, _owner, "Wrong coin owner!");
    assert.equal(uri.toString(), "localhost:3001/coins/" + _id, "Wrong token URI!");
}

// 4 asserts
const assertPrices = async (_coinsInstance, _isDiscounted, _bronzePrice, _silverPrice, _goldPrice, _diamondPrice) => {
    let prices;
    if (_isDiscounted) {
        prices = await _coinsInstance.getTierPrices(true);
    } else {
        prices = await _coinsInstance.getTierPrices(false);
    }
    assert.equal(prices[0].toString(), _bronzePrice.toString(), "Wrong bronze price!");
    assert.equal(prices[1].toString(), _silverPrice.toString(), "Wrong silver price!");
    assert.equal(prices[2].toString(), _goldPrice.toString(), "Wrong gold price!");
    assert.equal(prices[3].toString(), _diamondPrice.toString(), "Wrong diamond price!");
}

const assertContractOwner = async (_coinsInstance, _ownerAccount) => {
    const owner = await _coinsInstance.owner();
    assert.equal(owner, _ownerAccount, "Owner is not right!");
}

module.exports = {
    assertFounderBools,
    assertFounder,
    assertCounters,
    assertCoin,
    assertPrices,
    assertContractOwner,
};

// const assertRevert = async (_function, _args, _ethArgs, _errMsg) => {
//     let errMsg = "";
//     try {
//         await _function(_args, { _ethArgs });
//     } catch (err) {
//         if (err.reason) {
//             errMsg = err.reason;
//         } else {
//             throw err;
//         }
//     }
//     assert.equal(errMsg, _errMsg, "missing error");
// }