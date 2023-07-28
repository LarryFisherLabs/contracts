const { createAnt, createDiscountAnt } = require("../test-utils/ants/ants-utils");
const { assertCounters, assertPrices, assertContractOwner } = require("../test-utils/coins/coins-asserts");
const { addFounderUnauth, addExistingFounder, addFounderWNoValue, badBuySkimp, founderBadBuyCoinOrder, founderBadBuyFCAlreadyOwner, nonFounderBadBuyFC, badExactBuyBadIndexes } = require("../test-utils/coins/coins-reversion");
const { addFounder, buyCoin, buyFounderCoin, buyXCoinsEvenDistr, logContractState, updateCountsAndPrices, purchaseCoinWAsserts, purchaseFCWAsserts } = require("../test-utils/coins/coins-utils");
const { toWei, getBalance } = require("../test-utils/utils");

const Coins = artifacts.require("Coins");
const Ants = artifacts.require("Ants");

const basicAnt = [0, 0, 0, 0, 0, 0, 2, 3, 0, 4, 1, 1, 0, 0, 2];
const raritiesBaseAnt = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const antBasePrice = 990;
const expensiveAnt = [6, 3, 2, 1, 2, 1, 0, 0, 1, 6, 0, 0, 1, 2, 0];
const raritiesExpensiveAnt = [4, 4, 4, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4];
const antExpensivePrice = 18810;
const antPriceDividend = 100000;

const startingMinPrice = 1;

contract("Coins", (accounts) => {
    let coinsInstance;
    let antsInstance;

    it("should have proper name, symbol and owner", async () => {
        coinsInstance = await Coins.deployed();
        const name = await coinsInstance.name();
        const symbol = await coinsInstance.symbol();
    
        assert.equal(name, "BitCowArcadeToken", "name is not right");
        assert.equal(symbol, "BCAT", "symbol is not right");
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
        await badBuySkimp(coinsInstance, accounts[2], toWei((startingMinPrice * 10 - 1) / 10000));
        await badBuySkimp(coinsInstance, accounts[2], toWei((startingMinPrice * 20 - 1) / 10000), 1);
        await badBuySkimp(coinsInstance, accounts[2], toWei((startingMinPrice * 30 - 1) / 10000), 2);
        await badBuySkimp(coinsInstance, accounts[2], toWei((startingMinPrice * 40 - 1) / 10000), 3);
    });

    it("should have proper counts and prices", async () => {
        await assertCounters(coinsInstance, 0, 0, 0, 0, 0);
        await assertPrices(coinsInstance, false, toWei(startingMinPrice / 1000), toWei(startingMinPrice * 2 / 1000), toWei(startingMinPrice * 3 / 1000), toWei(startingMinPrice * 4 / 1000));
        await assertPrices(coinsInstance, true, toWei(startingMinPrice / 2000), toWei(startingMinPrice / 1000), toWei(startingMinPrice * 15 / 10000), toWei(startingMinPrice * 2 / 1000));
    });

    it("should allow founder to purchase founder coin", async () => {
        await buyFounderCoin(coinsInstance, accounts[0], toWei("100"));
        await assertCounters(coinsInstance, 1, 0, 0, 0, 0);
        await assertPrices(coinsInstance, false, toWei(startingMinPrice / 1000), toWei(startingMinPrice * 2 / 1000), toWei(startingMinPrice * 3 / 1000), toWei(startingMinPrice * 4 / 1000));
        await buyFounderCoin(coinsInstance, accounts[1], toWei("1"), toWei("1"), toWei("2"));
        await assertCounters(coinsInstance, 2, 0, 0, 0, 0);
        await assertPrices(coinsInstance, false, toWei(startingMinPrice / 1000), toWei(startingMinPrice * 2 / 1000), toWei(startingMinPrice * 3 / 1000), toWei(startingMinPrice * 4 / 1000));
    });

    it("shouldn't allow founder to purchase founder coin twice", async () => {
        await founderBadBuyFCAlreadyOwner(coinsInstance, accounts[0]);
        await founderBadBuyFCAlreadyOwner(coinsInstance, accounts[1]);
    });

    it("shouldn't allow founder to purchase coin for under min discounted price", async () => {
        await badBuySkimp(coinsInstance, accounts[0], toWei((startingMinPrice * 100 / 2 - 1) / 100000));
        await badBuySkimp(coinsInstance, accounts[1], toWei((startingMinPrice * 20 - 1) / 10000), 3);
    });

    it("should allow founders to purchase diamond coins for min price", async () => {
        await buyCoin(coinsInstance, accounts[0], toWei(startingMinPrice * 2 / 1000), 2, 3, true, true);
        await assertCounters(coinsInstance, 3, 0, 0, 0, 1);
        await assertPrices(coinsInstance, false, toWei(startingMinPrice / 1000), toWei(startingMinPrice * 2 / 1000), toWei(startingMinPrice * 3 / 1000), toWei(startingMinPrice * 4 / 1000));
        await buyCoin(coinsInstance, accounts[1], toWei(startingMinPrice * 2 / 1000), 3, 3, true, false);
        await assertCounters(coinsInstance, 4, 0, 0, 0, 2);
        await assertPrices(coinsInstance, false, toWei(startingMinPrice / 1000), toWei(startingMinPrice * 2 / 1000), toWei(startingMinPrice * 3 / 1000), toWei(startingMinPrice * 4 / 1000));
    });

    // it("shouldn't allow founders to purchase basic ants under minimum", async () => {
    //     antsInstance = await Ants.deployed();
    //     await antsInstance.createAnt(basicAnt, { from: accounts[0], value: (antBasePrice - 1) / antPriceDividend });
    //     await antsInstance.createAnt(basicAnt, { from: accounts[1], value: (antBasePrice - 1) / antPriceDividend });
    // });

    it("should allow founders to purchase basic ants", async () => {
        antsInstance = await Ants.deployed();
        await createAnt(antsInstance, accounts[0], antBasePrice / antPriceDividend, basicAnt, raritiesBaseAnt, 0);
        await createAnt(antsInstance, accounts[1], antBasePrice / antPriceDividend, basicAnt, raritiesBaseAnt, 1);
    });

    it("should allow founders to purchase expensive ants", async () => {
        await createAnt(antsInstance, accounts[0], antExpensivePrice / antPriceDividend, expensiveAnt, raritiesExpensiveAnt, 2);
        await createAnt(antsInstance, accounts[1], antExpensivePrice / antPriceDividend, expensiveAnt, raritiesExpensiveAnt, 3);
    });

    it("should allow founders to purchase founder discount basic ants", async () => {
        await createDiscountAnt(antsInstance, accounts[0], antBasePrice / 2 / antPriceDividend, basicAnt, raritiesBaseAnt, 4, 0, 4);
        await createDiscountAnt(antsInstance, accounts[1], antBasePrice / 2 / antPriceDividend, basicAnt, raritiesBaseAnt, 5, 1, 4);
    });

    it("should allow founders to purchase diamond discount expensive ants", async () => {
        await createDiscountAnt(antsInstance, accounts[0], antExpensivePrice * 3 / 5 / antPriceDividend, expensiveAnt, raritiesExpensiveAnt, 6, 2, 3);
        await createDiscountAnt(antsInstance, accounts[1], antExpensivePrice * 3 / 5 / antPriceDividend, expensiveAnt, raritiesExpensiveAnt, 7, 3, 3);
    });

    // it("shouldn't allow founder to buy second FC after discount bool change", async () => {
    //     await founderBadBuyFCAlreadyOwner(coinsInstance, accounts[0]);
    //     await founderBadBuyFCAlreadyOwner(coinsInstance, accounts[1]);
    // });

    // it("shouldn't allow founder w/o discount bad buy: skimp", async () => {
    //     await badBuySkimp(coinsInstance, accounts[0], toWei(startingMinPrice / 2 / 1000));
    //     await badBuySkimp(coinsInstance, accounts[0], toWei((startingMinPrice * 10 - 1) / 10000));
    //     await badBuySkimp(coinsInstance, accounts[0], toWei((startingMinPrice * 20 - 1) / 10000), 1);
    //     await badBuySkimp(coinsInstance, accounts[0], toWei((startingMinPrice * 30 - 1) / 10000), 2);
    //     await badBuySkimp(coinsInstance, accounts[0], toWei((startingMinPrice * 40 - 1) / 10000), 3);
    //     await badBuySkimp(coinsInstance, accounts[1], toWei((startingMinPrice * 10 - 1) / 10000));
    //     await badBuySkimp(coinsInstance, accounts[1], toWei((startingMinPrice * 20 - 1) / 10000), 1);
    //     await badBuySkimp(coinsInstance, accounts[1], toWei((startingMinPrice * 30 - 1) / 10000), 2);
    //     await badBuySkimp(coinsInstance, accounts[1], toWei((startingMinPrice * 40 - 1) / 10000), 3);
    // });

    // let prices = [startingMinPrice, startingMinPrice * 2, startingMinPrice * 3, startingMinPrice * 4];
    // let counts = [4, 0, 0, 0, 2];
    // const loopCount0 = 7;

    // for (let i = 0; i < loopCount0; i++) {
    //     it("should function normally through " + (204 + 200 * i) + " purchases even spread colors and accounts", async () => {
    //         const isAssertingAll = (i % 5) === 0;
    //         const result = await buyXCoinsEvenDistr(coinsInstance, 200, prices, counts, accounts, isAssertingAll);
    //         prices = result.prices;
    //         counts = result.counts;
    //         logContractState(counts[0], prices, counts, await getBalance(coinsInstance.address));
    //     });
    // }

    // it("should have proper name, symbol and owner", async () => {
    //     coinsInstance = await Coins.deployed();
    //     const name = await coinsInstance.name();
    //     const symbol = await coinsInstance.symbol();
    
    //     assert.equal(name, "BitCowArcadeToken", "name is not right");
    //     assert.equal(symbol, "BCAT", "symbol is not right");
    //     await assertContractOwner(coinsInstance, accounts[0]);
    // });

    // it("shouldn't allow non-owner to add founder", async () => {
    //     await addFounderUnauth(coinsInstance, accounts[2], accounts[1]);
    //     await addFounderUnauth(coinsInstance, accounts[3], accounts[1]);
    //     await addFounderUnauth(coinsInstance, accounts[4], accounts[1]);
    // });

    // it("should allow owner to add founder", async () => {
    //     await addFounder(coinsInstance, accounts[2], toWei(100), accounts[0]);
    //     await addFounder(coinsInstance, accounts[3], toWei("1"), accounts[0]);
    //     await addFounder(coinsInstance, accounts[15], toWei(.001), accounts[0]);
    //     await addFounder(coinsInstance, accounts[16], toWei(5), accounts[0]);
    // });

    // it("shouldn't allow owner to add founder twice or with no value", async () => {
    //     await addExistingFounder(coinsInstance, accounts[0], accounts[0]);
    //     await addExistingFounder(coinsInstance, accounts[1], accounts[0]);
    //     await addExistingFounder(coinsInstance, accounts[2], accounts[0]);
    //     await addExistingFounder(coinsInstance, accounts[3], accounts[0]);
    //     await addExistingFounder(coinsInstance, accounts[15], accounts[0]);
    //     await addExistingFounder(coinsInstance, accounts[16], accounts[0]);
    //     await addFounderWNoValue(coinsInstance, accounts[4], 0, accounts[0]);
    //     await addFounderWNoValue(coinsInstance, accounts[5], 0, accounts[0]);
    //     await addFounderWNoValue(coinsInstance, accounts[4], toWei(".00009"), accounts[0]);
    //     await addFounderWNoValue(coinsInstance, accounts[5], toWei(".00009"), accounts[0]);
    // });

    // it("shouldn't allow someone to create exact coin w/ out of bounds index", async () => {
    //     await badExactBuyBadIndexes(coinsInstance, accounts[0]);
    // });

    // it("shouldn't allow founder to create normal coin first", async () => {
    //     await founderBadBuyCoinOrder(coinsInstance, accounts[2]);
    //     await founderBadBuyCoinOrder(coinsInstance, accounts[3]);
    //     await founderBadBuyCoinOrder(coinsInstance, accounts[15]);
    //     await founderBadBuyCoinOrder(coinsInstance, accounts[16]);
    // });

    // it("shouldn't allow non-founders to buy founder coin", async () => {
    //     await nonFounderBadBuyFC(coinsInstance, accounts[19]);
    //     await nonFounderBadBuyFC(coinsInstance, accounts[4]);
    // });

    // it("shouldn't allow purchase under minimum", async () => {
    //     await badBuySkimp(coinsInstance, accounts[4], toWei((prices[0] - 1) / 1000));
    //     await badBuySkimp(coinsInstance, accounts[5], toWei((prices[1] - 1) / 1000), 1);
    //     await badBuySkimp(coinsInstance, accounts[17], toWei((prices[2] - 1) / 1000), 2);
    //     await badBuySkimp(coinsInstance, accounts[18], toWei((prices[3] - 1) / 1000), 3);
    // });

    // it("should have proper counts and prices", async () => {
    //     await assertCounters(coinsInstance, counts[0], counts[1], counts[2], counts[3], counts[4]);
    //     await assertPrices(coinsInstance, false, toWei(prices[0] / 1000), toWei(prices[1] / 1000), toWei(prices[2] / 1000), toWei(prices[3] / 1000));
    //     await assertPrices(coinsInstance, true, toWei(prices[0] / 2000), toWei(prices[1] / 2000), toWei(prices[2] / 2000), toWei(prices[3] / 2000));
    // });

    // it("should allow founder to purchase founder coin", async () => {
    //     let result = await purchaseFCWAsserts(coinsInstance, accounts[2], 100, 0, counts, prices);
    //     result = await purchaseFCWAsserts(coinsInstance, accounts[3], 1, 1, result.counts, result.prices);
    //     result = await purchaseFCWAsserts(coinsInstance, accounts[15], .001, 2, result.counts, result.prices);
    //     result = await purchaseFCWAsserts(coinsInstance, accounts[16], 5, 10, result.counts, result.prices);
    //     counts = result.counts;
    //     prices = result.prices;
    // });

    // it("shouldn't allow founder to purchase founder coin twice", async () => {
    //     await founderBadBuyFCAlreadyOwner(coinsInstance, accounts[0]);
    //     await founderBadBuyFCAlreadyOwner(coinsInstance, accounts[1]);
    //     await founderBadBuyFCAlreadyOwner(coinsInstance, accounts[2]);
    //     await founderBadBuyFCAlreadyOwner(coinsInstance, accounts[3]);
    //     await founderBadBuyFCAlreadyOwner(coinsInstance, accounts[15]);
    //     await founderBadBuyFCAlreadyOwner(coinsInstance, accounts[16]);
    // });

    // it("shouldn't allow founder to purchase coin for under min discounted price", async () => {
    //     await badBuySkimp(coinsInstance, accounts[2], toWei((prices[0] * 10 - 1) / 20000));
    //     await badBuySkimp(coinsInstance, accounts[3], toWei((prices[3] * 10 - 1) / 20000), 3);
    //     await badBuySkimp(coinsInstance, accounts[15], toWei((prices[1] * 10 - 1) / 20000), 1);
    //     await badBuySkimp(coinsInstance, accounts[16], toWei((prices[2] * 10 - 1) / 20000), 2);
    //     await badBuySkimp(coinsInstance, accounts[0], toWei((prices[0] * 10 - 1) / 10000));
    //     await badBuySkimp(coinsInstance, accounts[1], toWei((prices[3] * 10 - 1) / 10000), 3);
    // });

    // it("should allow founders to purchase diamond/silver coins for min price through both methods", async () => {
    //     let result = await purchaseCoinWAsserts(coinsInstance, accounts[2], counts[0], 3, true, prices[3] / 2000, counts, prices);
    //     result = await purchaseCoinWAsserts(coinsInstance, accounts[3], result.counts[0], 3, true, result.prices[3] / 2000, result.counts, result.prices);
    //     result = await purchaseCoinWAsserts(coinsInstance, accounts[15], result.counts[0], 1, true, result.prices[1] / 2000, result.counts, result.prices);
    //     result = await purchaseCoinWAsserts(coinsInstance, accounts[16], result.counts[0], 1, true, result.prices[1] / 2000, result.counts, result.prices);
    //     counts = result.counts;
    //     prices = result.prices;
    // });

    // it("shouldn't allow founder to buy second FC after discount bool change", async () => {
    //     await founderBadBuyFCAlreadyOwner(coinsInstance, accounts[0]);
    //     await founderBadBuyFCAlreadyOwner(coinsInstance, accounts[1]);
    //     await founderBadBuyFCAlreadyOwner(coinsInstance, accounts[2]);
    //     await founderBadBuyFCAlreadyOwner(coinsInstance, accounts[3]);
    //     await founderBadBuyFCAlreadyOwner(coinsInstance, accounts[15]);
    //     await founderBadBuyFCAlreadyOwner(coinsInstance, accounts[16]);
    // });

    // it("shouldn't allow founder w/o discount bad buy: skimp", async () => {
    //     await badBuySkimp(coinsInstance, accounts[2], toWei(prices[0] / 2000));
    //     await badBuySkimp(coinsInstance, accounts[2], toWei(prices[1] / 2000), 1);
    //     await badBuySkimp(coinsInstance, accounts[2], toWei(prices[2] / 2000), 2);
    //     await badBuySkimp(coinsInstance, accounts[2], toWei(prices[3] / 2000), 3);
    //     await badBuySkimp(coinsInstance, accounts[3], toWei(prices[0] / 2000));
    //     await badBuySkimp(coinsInstance, accounts[3], toWei(prices[1] / 2000), 1);
    //     await badBuySkimp(coinsInstance, accounts[3], toWei(prices[2] / 2000), 2);
    //     await badBuySkimp(coinsInstance, accounts[3], toWei(prices[3] / 2000), 3);
    //     await badBuySkimp(coinsInstance, accounts[15], toWei(prices[0] / 2000));
    //     await badBuySkimp(coinsInstance, accounts[15], toWei(prices[1] / 2000), 1);
    //     await badBuySkimp(coinsInstance, accounts[15], toWei(prices[2] / 2000), 2);
    //     await badBuySkimp(coinsInstance, accounts[15], toWei(prices[3] / 2000), 3);
    //     await badBuySkimp(coinsInstance, accounts[16], toWei(prices[0] / 2000));
    //     await badBuySkimp(coinsInstance, accounts[16], toWei(prices[1] / 2000), 1);
    //     await badBuySkimp(coinsInstance, accounts[16], toWei(prices[2] / 2000), 2);
    //     await badBuySkimp(coinsInstance, accounts[16], toWei(prices[3] / 2000), 3);
    //     await badBuySkimp(coinsInstance, accounts[0], toWei(prices[0] / 2000));
    //     await badBuySkimp(coinsInstance, accounts[0], toWei((prices[0] - 1) / 1000));
    //     await badBuySkimp(coinsInstance, accounts[0], toWei(prices[1] / 2000), 1);
    //     await badBuySkimp(coinsInstance, accounts[0], toWei(prices[2] / 2000), 2);
    //     await badBuySkimp(coinsInstance, accounts[0], toWei(prices[3] / 2000), 3);
    //     await badBuySkimp(coinsInstance, accounts[1], toWei(prices[0] / 2000));
    //     await badBuySkimp(coinsInstance, accounts[1], toWei(prices[1] / 2000), 1);
    //     await badBuySkimp(coinsInstance, accounts[1], toWei(prices[2] / 2000), 2);
    //     await badBuySkimp(coinsInstance, accounts[1], toWei(prices[3] / 2000), 3);
    // });

    // for (let i = 0; i < loopCount0; i++) {
    //     it("should function normally through " + (1604 + 200 * i) + " purchases even spread colors and accounts", async () => {
    //         const isAssertingAll = (i % 5) === 0;
    //         const result = await buyXCoinsEvenDistr(coinsInstance, 200, prices, counts, accounts, isAssertingAll);
    //         prices = result.prices;
    //         counts = result.counts;
    //         logContractState(counts[0], prices, counts, await getBalance(coinsInstance.address));
    //     });
    // }
});


// it("should", async () => {

// });