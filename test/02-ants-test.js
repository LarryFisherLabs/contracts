const { assertContractOwner } = require("../test-utils/ants/ants-asserts");

const Ants = artifacts.require("Ants");

contract("Ants", (accounts) => {
    let antsInstance;

    let ownedAnts = [];

    const maxIndexByRarity = [10000, 3000, 1000, 300, 80, 3];

    let partCounters = [];
    partCounters[0] = [maxIndexByRarity[0], maxIndexByRarity[3], maxIndexByRarity[4], maxIndexByRarity[1], maxIndexByRarity[3], maxIndexByRarity[3], maxIndexByRarity[4], maxIndexByRarity[1], maxIndexByRarity[1], maxIndexByRarity[2], maxIndexByRarity[2], maxIndexByRarity[3], maxIndexByRarity[2], maxIndexByRarity[2], maxIndexByRarity[2]];
    partCounters[1] = [maxIndexByRarity[0], maxIndexByRarity[1], maxIndexByRarity[3], maxIndexByRarity[4], maxIndexByRarity[2]];
    partCounters[2] = [maxIndexByRarity[0], maxIndexByRarity[3], maxIndexByRarity[4]];
    partCounters[3] = [maxIndexByRarity[0], maxIndexByRarity[3], maxIndexByRarity[4]];
    partCounters[4] = [maxIndexByRarity[0], maxIndexByRarity[2], maxIndexByRarity[3]];
    partCounters[5] = [maxIndexByRarity[0], maxIndexByRarity[3]];
    partCounters[6] = [maxIndexByRarity[3], maxIndexByRarity[3], maxIndexByRarity[0]];
    partCounters[7] = [maxIndexByRarity[4], maxIndexByRarity[4], maxIndexByRarity[4], maxIndexByRarity[0], maxIndexByRarity[3], maxIndexByRarity[4], maxIndexByRarity[4], maxIndexByRarity[2], maxIndexByRarity[2], maxIndexByRarity[1], maxIndexByRarity[2], maxIndexByRarity[2]];
    partCounters[8] = [maxIndexByRarity[0], maxIndexByRarity[3], maxIndexByRarity[3], maxIndexByRarity[3]];
    partCounters[9] = [maxIndexByRarity[4], maxIndexByRarity[2], maxIndexByRarity[3], maxIndexByRarity[3], maxIndexByRarity[0], maxIndexByRarity[0], maxIndexByRarity[4], maxIndexByRarity[1], maxIndexByRarity[1], maxIndexByRarity[3], maxIndexByRarity[3], maxIndexByRarity[3], maxIndexByRarity[3]];
    partCounters[10] = [maxIndexByRarity[4], maxIndexByRarity[0]];
    partCounters[11] = [maxIndexByRarity[4], maxIndexByRarity[0]];
    partCounters[12] = [maxIndexByRarity[0], maxIndexByRarity[4], maxIndexByRarity[2], maxIndexByRarity[3], maxIndexByRarity[4], maxIndexByRarity[3], maxIndexByRarity[4], maxIndexByRarity[3], maxIndexByRarity[3], maxIndexByRarity[3], maxIndexByRarity[4]];
    partCounters[13] = [maxIndexByRarity[0], maxIndexByRarity[3], maxIndexByRarity[4], maxIndexByRarity[3], maxIndexByRarity[3], maxIndexByRarity[3], maxIndexByRarity[4], maxIndexByRarity[3], maxIndexByRarity[4], maxIndexByRarity[3], maxIndexByRarity[3], maxIndexByRarity[3], maxIndexByRarity[3], maxIndexByRarity[3], maxIndexByRarity[3], maxIndexByRarity[4]];
    partCounters[14] = [maxIndexByRarity[4], maxIndexByRarity[3], maxIndexByRarity[0]];

    it("should have proper name, symbol and owner", async () => {
        antsInstance = await Ants.deployed();
        const name = await antsInstance.name();
        const symbol = await antsInstance.symbol();
    
        assert.equal(name, "ArmyAntsToken", "name is not right");
        assert.equal(symbol, "AAT", "symbol is not right");
        await assertContractOwner(antsInstance, accounts[0]);
    });

    it("should purchase ant", async () => {
        antsInstance = await Ants.deployed();
        const countBefore = await antsInstance.COUNTER();
        assert.equal(countBefore, 0, "Wrong pre buy count!");
        const price = await antsInstance.getDnaPrice(validAnts[0]);
        await antsInstance.createAnt(validAnts[0], { from: accounts[0], value: price });
        const countAfter = await antsInstance.COUNTER();
        assert.equal(countAfter, 1, "Wrong post buy count!");
        const ant = await antsInstance.getAnt(0);
        assert.equal(ant.id, 0, "Wrong ant id!");
        assert.equal(ant.properties[0].dna, 0, "Wrong ant dna!");
        assert.equal(ant.properties[0].rarity, 0, "Wrong ant dna rarity!");

        assert.equal(ant.properties[1].dna, 0, "Wrong ant dna!");
        assert.equal(ant.properties[1].rarity, 0, "Wrong ant dna rarity!");

        assert.equal(ant.properties[2].dna, 0, "Wrong ant dna!");
        assert.equal(ant.properties[2].rarity, 0, "Wrong ant dna rarity!");

        assert.equal(ant.properties[3].dna, 0, "Wrong ant dna!");
        assert.equal(ant.properties[3].rarity, 0, "Wrong ant dna rarity!");

        assert.equal(ant.properties[4].dna, 0, "Wrong ant dna!");
        assert.equal(ant.properties[4].rarity, 0, "Wrong ant dna rarity!");

        assert.equal(ant.properties[5].dna, 0, "Wrong ant dna!");
        assert.equal(ant.properties[5].rarity, 0, "Wrong ant dna rarity!");

        assert.equal(ant.properties[6].dna, 2, "Wrong ant dna!");
        assert.equal(ant.properties[6].rarity, 0, "Wrong ant dna rarity!");

        assert.equal(ant.properties[7].dna, 3, "Wrong ant dna!");
        assert.equal(ant.properties[7].rarity, 0, "Wrong ant dna rarity!");

        assert.equal(ant.properties[8].dna, 0, "Wrong ant dna!");
        assert.equal(ant.properties[8].rarity, 0, "Wrong ant dna rarity!");

        assert.equal(ant.properties[9].dna, 4, "Wrong ant dna!");
        assert.equal(ant.properties[9].rarity, 0, "Wrong ant dna rarity!");
        
        assert.equal(ant.properties[10].dna, 1, "Wrong ant dna!");
        assert.equal(ant.properties[10].rarity, 0, "Wrong ant dna rarity!");

        assert.equal(ant.properties[11].dna, 1, "Wrong ant dna!");
        assert.equal(ant.properties[11].rarity, 0, "Wrong ant dna rarity!");

        assert.equal(ant.properties[12].dna, 0, "Wrong ant dna!");
        assert.equal(ant.properties[12].rarity, 0, "Wrong ant dna rarity!");

        assert.equal(ant.properties[13].dna, 0, "Wrong ant dna!");
        assert.equal(ant.properties[13].rarity, 0, "Wrong ant dna rarity!");

        assert.equal(ant.properties[14].dna, 2, "Wrong ant dna!");
        assert.equal(ant.properties[14].rarity, 0, "Wrong ant dna rarity!");
    });

    // it("", async () => {
    //     let errMsg = "";
    //     try {
            
    //     } catch (err) {
    //         errMsg = err;
    //     }
    //     assert.equal(errMsg, "", "missing error");
    //     errMsg = "";
    //     try {
            
    //     } catch (err) {
    //         errMsg = err;
    //     }
    //     assert.equal(errMsg, "", "missing error");
    //     errMsg = "";
    //     try {
            
    //     } catch (err) {
    //         errMsg = err;
    //     }
    //     assert.equal(errMsg, "", "missing error");
    // })
});


// it("should", async () => {

// });