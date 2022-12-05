const Ants = artifacts.require("Ants");

contract("Ants", (accounts) => {
    let antsInstance;
    let validAnts = [
        000000000000020300040101000002,
        060302020201010101000000010200,
    ];
    let ownedAnts = [];
    let invalidAnts = [
        020101020100000000010000000000,
        000101020100000000010000000000,
        000001020100000000010000000000,
        000001020100000000000000000000,
    ];
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