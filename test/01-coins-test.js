const { assertCounters, assertPrices, assertContractOwner } = require("../test-utils/coins/coins-asserts");
const { addFounderUnauth, addExistingFounder, addFounderWNoValue, badBuySkimp, founderBadBuyCoinOrder, founderBadBuyFCAlreadyOwner, nonFounderBadBuyFC, badExactBuyBadIndexes } = require("../test-utils/coins/coins-reversion");
const { addFounder, buyCoin, buyFounderCoin, buyXCoinsEvenDistr, buyXCoinsNoAssertsEvenDistr, logContractState } = require("../test-utils/coins/coins-utils");
const { toWei, getBalance } = require("../test-utils/utils");

const Coins = artifacts.require("Coins");

contract("Coins", (accounts) => {
    let coinsInstance;

    it("should have proper name, symbol and owner", async () => {
        coinsInstance = await Coins.deployed();
        const name = await coinsInstance.name();
        const symbol = await coinsInstance.symbol();
    
        assert.equal(name, "BitCowArcadeToken", "name is not right");
        assert.equal(symbol, "BCAT", "symbal is not right");
        await assertContractOwner(coinsInstance, accounts[0]);
    });

    it("shouldn't allow non-owner to add founder", async () => {
        await addFounderUnauth(coinsInstance, accounts[0], accounts[1]);
        await addFounderUnauth(coinsInstance, accounts[1], accounts[1]);
        await addFounderUnauth(coinsInstance, accounts[2], accounts[1]);
    });

    it("should allow owner to add founder", async () => {
        await addFounder(coinsInstance, accounts[0], toWei(100), accounts[0]);
        await addFounder(coinsInstance, accounts[1], toWei("1"), accounts[0]);
    });

    it("shouldn't allow owner to add founder twice or with no value", async () => {
        await addExistingFounder(coinsInstance, accounts[0], accounts[0]);
        await addExistingFounder(coinsInstance, accounts[1], accounts[0]);
        await addFounderWNoValue(coinsInstance, accounts[2], 0, accounts[0]);
        await addFounderWNoValue(coinsInstance, accounts[3], 0, accounts[0]);
        await addFounderWNoValue(coinsInstance, accounts[2], toWei(".00009"), accounts[0]);
        await addFounderWNoValue(coinsInstance, accounts[3], toWei(".00009"), accounts[0]);
    });

    it("shouldn't allow someone to create exact coin w/ out of bounds index", async () => {
        await badExactBuyBadIndexes(coinsInstance, accounts[0]);
    });

    it("shouldn't allow founder to create normal coin first", async () => {
        await founderBadBuyCoinOrder(coinsInstance, accounts[0]);
        await founderBadBuyCoinOrder(coinsInstance, accounts[1]);
    });

    it("shouldn't allow non-founders to buy founder coin", async () => {
        await nonFounderBadBuyFC(coinsInstance, accounts[2]);
    });

    it("shouldn't allow purchase under minimum", async () => {
        await badBuySkimp(coinsInstance, accounts[2], toWei(".0009"));
        await badBuySkimp(coinsInstance, accounts[2], toWei(".0019"), 1);
        await badBuySkimp(coinsInstance, accounts[2], toWei(".0029"), 2);
        await badBuySkimp(coinsInstance, accounts[2], toWei(".0039"), 3);
    });

    it("should have proper counts and prices", async () => {
        await assertCounters(coinsInstance, 0, 0, 0, 0, 0);
        await assertPrices(coinsInstance, false, toWei(".001"), toWei(".002"), toWei(".003"), toWei(".004"));
        await assertPrices(coinsInstance, true, toWei(".0005"), toWei(".001"), toWei(".0015"), toWei(".002"));
    });

    it("should allow founder to purchase founder coin", async () => {
        await buyFounderCoin(coinsInstance, accounts[0], toWei("100"));
        await assertCounters(coinsInstance, 1, 0, 0, 0, 0);
        await assertPrices(coinsInstance, false, toWei(".001"), toWei(".002"), toWei(".003"), toWei(".004"));
        await buyFounderCoin(coinsInstance, accounts[1], toWei("1"), toWei("1"), toWei("2"));
        await assertCounters(coinsInstance, 2, 0, 0, 0, 0);
        await assertPrices(coinsInstance, false, toWei(".001"), toWei(".002"), toWei(".003"), toWei(".004"));
    });

    it("shouldn't allow founder to purchase founder coin twice", async () => {
        await founderBadBuyFCAlreadyOwner(coinsInstance, accounts[0]);
        await founderBadBuyFCAlreadyOwner(coinsInstance, accounts[1]);
    });

    it("shouldn't allow founder to purchase coin for under min discounted price", async () => {
        await badBuySkimp(coinsInstance, accounts[0], toWei(".00049"));
        await badBuySkimp(coinsInstance, accounts[1], toWei(".0019"), 3);
    });

    it("should allow founders to purchase diamond coins for min price through both methods", async () => {
        await buyCoin(coinsInstance, accounts[0], toWei(".002"), 2, 3, true, true);
        await assertCounters(coinsInstance, 3, 0, 0, 0, 1);
        await assertPrices(coinsInstance, false, toWei(".001"), toWei(".002"), toWei(".003"), toWei(".004"));
        await buyCoin(coinsInstance, accounts[1], toWei(".002"), 3, 3, true, false);
        await assertCounters(coinsInstance, 4, 0, 0, 0, 2);
        await assertPrices(coinsInstance, false, toWei(".001"), toWei(".002"), toWei(".003"), toWei(".004"));
    });

    it("shouldn't allow founder to buy second FC after discount bool change", async () => {
        await founderBadBuyFCAlreadyOwner(coinsInstance, accounts[0]);
        await founderBadBuyFCAlreadyOwner(coinsInstance, accounts[1]);
    });

    it("shouldn't allow founder w/o discount bad buy: skimp", async () => {
        await badBuySkimp(coinsInstance, accounts[0], toWei(".0005"));
        await badBuySkimp(coinsInstance, accounts[0], toWei(".0009"));
        await badBuySkimp(coinsInstance, accounts[0], toWei(".0019"), 1);
        await badBuySkimp(coinsInstance, accounts[0], toWei(".0029"), 2);
        await badBuySkimp(coinsInstance, accounts[0], toWei(".0039"), 3);
        await badBuySkimp(coinsInstance, accounts[1], toWei(".0009"));
        await badBuySkimp(coinsInstance, accounts[1], toWei(".0019"), 1);
        await badBuySkimp(coinsInstance, accounts[1], toWei(".0029"), 2);
        await badBuySkimp(coinsInstance, accounts[1], toWei(".0039"), 3);
    });

    let prices = [1, 2, 3, 4];
    let counts = [4, 0, 0, 0, 2];
    const loopCount0 = 35;

    for (let i = 0; i < loopCount0; i++) {
        it("should function normally through " + (204 + 200 * i) + " purchases even spread colors and accounts", async () => {
            const result = (i % 5) === 0 ? await buyXCoinsEvenDistr(coinsInstance, 200, prices, counts, accounts) : await buyXCoinsNoAssertsEvenDistr(coinsInstance, 200, prices, counts, accounts);
            prices = result.prices;
            counts = result.counts;
            logContractState(counts[0], prices, counts, await getBalance(coinsInstance.address));
        });
    }

    let balance = 0;

    it("should withdraw and redistribute", async () => {
        const currentBalance = await getBalance(coinsInstance.address);
        await coinsInstance.withdraw({ from: accounts[0] });
        for (let i = 0; i < 8; i++) {
            await web3.eth.sendTransaction({ from: accounts[0], to: accounts[i], value: toWei(currentBalance / 8) });
        }
        balance = balance + currentBalance;
    });

    const loopCount1 = 11
    for (let i = 0; i < loopCount1; i++) {
        it("should function normally through " + (4 + 200 * (i + loopCount0 + 1)) + " purchases even spread colors and accounts", async () => {
            const result = (i % 5) === 0 ? await buyXCoinsEvenDistr(coinsInstance, 200, prices, counts, accounts) : await buyXCoinsNoAssertsEvenDistr(coinsInstance, 200, prices, counts, accounts);
            prices = result.prices;
            counts = result.counts;
            logContractState(counts[0], prices, counts, balance + await getBalance(coinsInstance.address));
        });
    }

    it("should withdraw and redistribute", async () => {
        const currentBalance = await getBalance(coinsInstance.address);
        await coinsInstance.withdraw({ from: accounts[0] });
        for (let i = 0; i < 8; i++) {
            await web3.eth.sendTransaction({ from: accounts[0], to: accounts[i], value: toWei(currentBalance / 8) });
        }
        balance = balance + currentBalance;
    });

    for (let i = 0; i < 20; i++) {
        it("should function normally through " + (4 + 200 * (i + loopCount0 + loopCount1 + 1)) + " purchases even spread colors and accounts", async () => {
            const result = (i % 5) === 0 ? await buyXCoinsEvenDistr(coinsInstance, 200, prices, counts, accounts) : await buyXCoinsNoAssertsEvenDistr(coinsInstance, 200, prices, counts, accounts);
            prices = result.prices;
            counts = result.counts;
            logContractState(counts[0], prices, counts, balance + await getBalance(coinsInstance.address));
            const currentBalance = await getBalance(coinsInstance.address);
            await coinsInstance.withdraw({ from: accounts[0] });
            for (let i = 0; i < 8; i++) {
                await web3.eth.sendTransaction({ from: accounts[0], to: accounts[i], value: toWei(currentBalance / 8) });
            }
            balance = balance + currentBalance;
        });
    }
});


// it("should", async () => {

// });