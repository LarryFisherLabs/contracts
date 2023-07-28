// assert rarity prices

const { fromWei } = require("../utils");

const assertPartStock = async (_antsInstance, _secIndex, _partIndex, _stockVal) => {
    const stockVal = await _antsInstance.getPartInventory(_secIndex, _partIndex);
    assert.equal(stockVal, _stockVal, "Part inventory is wrong!");
}

const assertContractOwner = async (_antsInstance, _ownerAccount) => {
    const owner = await _antsInstance.owner();
    assert.equal(owner, _ownerAccount, "Owner is not right!");
}

const assertIsDiscountUsed = async (_antsInstance, _coinId, _isDiscountUsed) => {
    const isDiscountUsed = await _antsInstance.isDiscountUsed(_coinId);
    assert.equal(isDiscountUsed, _isDiscountUsed, "Wrong return bool from isDiscountUsed");
}

const assertPrice = async (_antsInstance, _antDna, _price, _discountIndex) => {
    const price = fromWei(await _antsInstance.getDnaPrice(_antDna, _discountIndex));
    assert.equal(price, _price, "Wrong price!");
}

const assertPrices = async (_antsInstance, _antDna, _noDiscountPrice) => {
    for (let i = 0; i < 6; i++) {
        const price = _noDiscountPrice * (10 - i) / 10
        await assertPrice(_antsInstance, _antDna, price, i);
    }
}

const assertAnt = async (_antsInstance, _antId, _dna, _rarities, _owner) => {
    const ant = await _antsInstance.getAnt(_antId);
    const owner = await _antsInstance.ownerOf(_antId);
    const uri = await _antsInstance.tokenURI(_antId);
    for (let i = 0; i < 15; i++) {
        assert.equal(ant[0][i], _dna[i], "Wrong attribute!");
        assert.equal(ant[1][i], _rarities[i], "Wrong rarity!");
    }
    assert.equal(owner, _owner, "Wrong ant owner!");
    assert.equal(uri.toString(), "localhost:3001/ants/" + _antId, "Wrong token URI!");
}

const assertCounter = async (_antsInstance, _counter) => {
    const COUNTER = await _antsInstance.COUNTER();
    assert.equal(COUNTER, _counter, "Wrong counter!");
}

module.exports = {
    assertPartStock,
    assertContractOwner,
    assertIsDiscountUsed,
    assertPrice,
    assertPrices,
    assertAnt,
    assertCounter,
};