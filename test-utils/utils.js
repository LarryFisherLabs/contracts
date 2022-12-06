const toWei = (_value) => {
    // const textValue = _textValue.slice(0, 12);
    return web3.utils.toWei(_value.toString());
}

const fromWei = (_value) => {
    return parseFloat(web3.utils.fromWei(_value.toString()));
}

const getBalance = async (_address) => {
    const balance = await web3.eth.getBalance(_address);
    return fromWei(balance);
}

const breakUpDna = (_dna, _sectionCount) => {
    let dna = [];
    for (let i = 0; i < _sectionCount; i++) {
        const attribute = _dna / 100**(_sectionCount - 1 - i) % 100;
        dna.push(attribute);
    }
    return dna;
}

module.exports = {
    toWei,
    fromWei,
    getBalance,
    breakUpDna,
};