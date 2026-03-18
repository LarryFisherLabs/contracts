const { expect } = require("chai");

let owner, account1, account2, account3, account4, denyList, coins, ants;

// 100000000000000 wei === 0.0001 eth
const toBigInt = (baseInt) => {
    return BigInt(baseInt.toString() + "00000000000000");
}

describe("-Deny List Tests-", function () {

    it("Should not be denied on init.", async function () {
        [owner, account1, account2, account3, account4] = await ethers.getSigners();
        const DenyList = await ethers.getContractFactory("DenyList");
        denyList = await DenyList.deploy();

        expect(await denyList.isDenied(account1)).to.equal(false);
    });

    it("Should now be denied", async function () {
        await denyList.deny(account1);
        expect(await denyList.isDenied(account1)).to.equal(true);
    });

    it("Should now be un-denied", async function () {
        await denyList.undeny(account1);
        expect(await denyList.isDenied(account1)).to.equal(false);
    });

});

describe("-Coin Tests-", function () {

    // must be put through toBigInt
    let prices = [10, 20, 30, 40];
    let totalCount = 0;
    let counts = [0, 0, 0, 0];

    const checkCountsPrices = async () => {
        let _prices = await coins.getTierPrices(false);
        let _discountPrices = await coins.getTierPrices(true);
        let _counts = await coins.getCounters();
        expect(_counts[0]).to.equal(totalCount);
        for (let i = 0; i < 4; i++) {
            expect(_prices[i]).to.equal(toBigInt(prices[i]));
            expect(_discountPrices[i]).to.equal(toBigInt(prices[i] / 2));
            expect(_counts[i + 1]).to.equal(counts[i]);
        }
    }

    const addCheckFounder = async (account, founderMiniVal) => {
        await coins.addFounder(account, toBigInt(founderMiniVal));
        let accountMiniVal = await coins.getFounderMiniVal(account)
        expect(accountMiniVal).to.equal(founderMiniVal)
    }

    const checkCoin = async (id, value, color, ownerAddy) => {
        let coin = await coins.getCoin(id);
        let _ownerAddy = await coins.ownerOf(id);
        expect(coin.value).to.equal(value);
        expect(coin.color).to.equal(color);
        expect(_ownerAddy).to.equal(ownerAddy);
    }

    it("Initiate coin contract.", async function () {
        const Coins = await ethers.getContractFactory("Coins");
        coins = await Coins.deploy(denyList.target);
    });

    describe("--Happy path functions--", function () {

        it("Check starting prices, discount prices, and counters.", async function () {
            await checkCountsPrices();
        });

        it("Add/check founders.", async function () {
            await addCheckFounder(owner, 100000)
            await addCheckFounder(account1, 10000)
            await addCheckFounder(account2, 1)
            await addCheckFounder(account3, 30)
        });

        it("Create/check founder coins with and without added value.", async function () {
            await coins.createFounderCoin();
            totalCount++;
            await coins.connect(account1).createFounderCoin({ value: toBigInt(2) });
            totalCount++;
            await coins.connect(account2).createFounderCoin({ value: toBigInt(100) });
            totalCount++;
            await coins.connect(account3).createFounderCoin();
            totalCount++;
            await checkCountsPrices();
            let ownerMiniVal = await coins.getFounderMiniVal(owner)
            expect(ownerMiniVal).to.equal(0)
            let account1MiniVal = await coins.getFounderMiniVal(account1)
            expect(account1MiniVal).to.equal(0)
            let account2MiniVal = await coins.getFounderMiniVal(account2)
            expect(account2MiniVal).to.equal(0)
            let account3MiniVal = await coins.getFounderMiniVal(account3)
            expect(account3MiniVal).to.equal(0)
            let isOwnerDiscounted = await coins.isDiscountMintAvail(0)
            expect(isOwnerDiscounted).to.equal(true)
            let isAccount1Discounted = await coins.isDiscountMintAvail(1)
            expect(isAccount1Discounted).to.equal(true)
            let isAccount2Discounted = await coins.isDiscountMintAvail(2)
            expect(isAccount2Discounted).to.equal(true)
            let isAccount3Discounted = await coins.isDiscountMintAvail(3)
            expect(isAccount3Discounted).to.equal(true)
            await checkCoin(0, toBigInt(100000), 4, owner);
            await checkCoin(1, toBigInt(10002), 4, account1);
            await checkCoin(2, toBigInt(101), 4, account2);
            await checkCoin(3, toBigInt(30), 4, account3);
        });

        it("Create/check normal coins all colors minimum value.", async function () {
            await coins.createCoin(3, { value: toBigInt(prices[3]) });
            await coins.connect(account1).createCoin(2, { value: toBigInt(prices[2]) });
            await coins.connect(account2).createCoin(1, { value: toBigInt(prices[1]) });
            await coins.connect(account4).createCoin(0, { value: toBigInt(prices[0]) });
            totalCount += 4;
            counts[0]++;
            counts[1]++;
            counts[2]++;
            counts[3]++;
            await checkCountsPrices();
            await checkCoin(4, toBigInt(prices[3]), 3, owner);
            await checkCoin(5, toBigInt(prices[2]), 2, account1);
            await checkCoin(6, toBigInt(prices[1]), 1, account2);
            await checkCoin(7, toBigInt(prices[0]), 0, account4);
        });

        it("Create/check discounted coins all colors minimum value.", async function () {
            await coins.createDiscountCoin(3, 0, { value: toBigInt(prices[3] / 2) });
            let firstCoinValue = prices[3]
            prices[0] += 10
            prices[1] += 10
            prices[2] += 10
            prices[3] += 10
            await coins.connect(account1).createDiscountCoin(2, 1, { value: toBigInt(prices[2] / 2) });
            await coins.connect(account2).createDiscountCoin(1, 2, { value: toBigInt(prices[1] / 2) });
            await coins.connect(account3).createDiscountCoin(0, 3, { value: toBigInt(prices[0] / 2) });
            totalCount += 4;
            counts[0]++;
            counts[1]++;
            counts[2]++;
            counts[3]++;
            await checkCountsPrices();
            await checkCoin(8, toBigInt(firstCoinValue), 3, owner);
            await checkCoin(9, toBigInt(prices[2]), 2, account1);
            await checkCoin(10, toBigInt(prices[1]), 1, account2);
            await checkCoin(11, toBigInt(prices[0]), 0, account3);
            let ownerMiniVal = await coins.getFounderMiniVal(owner)
            expect(ownerMiniVal).to.equal(0)
            let account1MiniVal = await coins.getFounderMiniVal(account1)
            expect(account1MiniVal).to.equal(0)
            let account2MiniVal = await coins.getFounderMiniVal(account2)
            expect(account2MiniVal).to.equal(0)
            let account3MiniVal = await coins.getFounderMiniVal(account3)
            expect(account3MiniVal).to.equal(0)
            let isOwnerDiscounted = await coins.isDiscountMintAvail(0)
            expect(isOwnerDiscounted).to.equal(false)
            let isAccount1Discounted = await coins.isDiscountMintAvail(1)
            expect(isAccount1Discounted).to.equal(false)
            let isAccount2Discounted = await coins.isDiscountMintAvail(2)
            expect(isAccount2Discounted).to.equal(false)
            let isAccount3Discounted = await coins.isDiscountMintAvail(3)
            expect(isAccount3Discounted).to.equal(false)
        });

        it("Increase all base prices.", async function () {
            //12, 13
            await coins.createCoin(0, { value: toBigInt(prices[0]) })
            await coins.createCoin(0, { value: toBigInt(prices[0]) })
            //14, 15
            await coins.createCoin(1, { value: toBigInt(prices[1]) })
            await coins.createCoin(1, { value: toBigInt(prices[1]) })
            //16, 17
            await coins.createCoin(2, { value: toBigInt(prices[2]) })
            await coins.createCoin(2, { value: toBigInt(prices[2]) })
            prices[0] += 10
            prices[1] += 10
            prices[2] += 10
            prices[3] += 10
            //18, 19
            await coins.createCoin(3, { value: toBigInt(prices[3]) })
            await coins.createCoin(3, { value: toBigInt(prices[3]) })

            totalCount += 8;
            counts[0] += 2;
            counts[1] += 2;
            counts[2] += 2;
            counts[3] += 2;
            prices[0] += 10
            prices[1] += 20
            prices[2] += 30
            prices[3] += 40

            await checkCountsPrices();
        });

        it("Transfer token between users and check owner balances.", async function () {
            let ownerBalance = await coins.balanceOf(owner)
            let account1Balance = await coins.balanceOf(account1)
            let testToken1Owner = await coins.ownerOf(4)
            let testToken2Owner = await coins.ownerOf(5)
            expect(ownerBalance).to.equal(11)
            expect(account1Balance).to.equal(3)
            expect(testToken1Owner).to.equal(owner)
            expect(testToken2Owner).to.equal(account1)

            await coins.transferFrom(owner, account1, 4)

            ownerBalance = await coins.balanceOf(owner)
            account1Balance = await coins.balanceOf(account1)
            testToken1Owner = await coins.ownerOf(4)
            expect(ownerBalance).to.equal(10)
            expect(account1Balance).to.equal(4)
            expect(testToken1Owner).to.equal(account1)

            await coins.connect(account1).transferFrom(account1, owner, 5)

            ownerBalance = await coins.balanceOf(owner)
            account1Balance = await coins.balanceOf(account1)
            testToken2Owner = await coins.ownerOf(5)
            expect(ownerBalance).to.equal(11)
            expect(account1Balance).to.equal(3)
            expect(testToken2Owner).to.equal(owner)

            await checkCountsPrices();
            await checkCoin(4, toBigInt(40), 3, account1);
            await checkCoin(5, toBigInt(30), 2, owner);
        })

        it("Check base URI and update it.", async function () {
            let baseURI = await coins.tokenURI(5)
            expect(baseURI).to.equal("https://nft-api-bphk.onrender.com/coins/11155111/1/5")
            await coins.updateBaseURI("squa")
            baseURI = await coins.tokenURI(5)
            expect(baseURI).to.equal("squa5")
        })

        let dummyURI
        it("Initiate dummy URI contract and check for functionality.", async function () {
            const DummyURI = await ethers.getContractFactory("DummyURI");
            dummyURI = await DummyURI.deploy();
            await coins.setURIContract(dummyURI.target);
            let baseURI = await coins.tokenURI(5)
            expect(baseURI).to.equal("test")
            await coins.updateBaseURI("squii")
            baseURI = await coins.tokenURI(5)
            expect(baseURI).to.equal("squii5")
        })

    });

    describe("--Failure testing--", function () {

        it("Try getting founder coin with former permission.", async function () {
            return expect(coins.createFounderCoin()).to.be.rejectedWith("VM Exception while processing transaction: revert");
        });

        it("Try getting founder coin with out former permission.", async function () {
            return expect(coins.connect(account4).createFounderCoin()).to.be.rejectedWith("VM Exception while processing transaction: revert");
        });

        it("Try getting discount bronze with used discount.", async function () {
            return expect(coins.createDiscountCoin(0, 0, { value: toBigInt(1000) })).to.be.rejectedWith("VM Exception while processing transaction: revert");
        });

        it("Try getting discount silver with used discount.", async function () {
            return expect(coins.createDiscountCoin(1, 0, { value: toBigInt(1000) })).to.be.rejectedWith("VM Exception while processing transaction: revert");
        });

        it("Try getting discount gold with used discount.", async function () {
            return expect(coins.createDiscountCoin(2, 0, { value: toBigInt(1000) })).to.be.rejectedWith("VM Exception while processing transaction: revert");
        });

        it("Try getting discount diamond with used discount.", async function () {
            return expect(coins.createDiscountCoin(3, 0, { value: toBigInt(1000) })).to.be.rejectedWith("VM Exception while processing transaction: revert");
        });

        it("Try getting discount bronze with no discount.", async function () {
            return expect(coins.createDiscountCoin(0, 7, { value: toBigInt(1000) })).to.be.rejectedWith("VM Exception while processing transaction: revert");
        });

        it("Try getting founder coin through create coin.", async function () {
            return expect(coins.createCoin(4, { value: toBigInt(1000) })).to.be.rejectedWith("VM Exception while processing transaction: revert");
        });

        let testFounderIndex = 20

        it("Add test founder with coin.", async function () {
            await addCheckFounder(owner, 10)
            await coins.createFounderCoin();
            totalCount++;
            await checkCountsPrices();
            let ownerMiniVal = await coins.getFounderMiniVal(owner)
            expect(ownerMiniVal).to.equal(0)
            let isOwnerDiscounted = await coins.isDiscountMintAvail(testFounderIndex)
            expect(isOwnerDiscounted).to.equal(true)
            await checkCoin(testFounderIndex, toBigInt(10), 4, owner);
        });

        it("Try getting founder coin through create discount coin.", async function () {
            return expect(coins.createDiscountCoin(4, testFounderIndex, { value: toBigInt(1000) })).to.be.rejectedWith("VM Exception while processing transaction: revert");
        });

        it("Try getting discount bronze coin under-price.", async function () {
            return expect(coins.createDiscountCoin(0, testFounderIndex, { value: toBigInt(prices[0] / 2 - 1) })).to.be.rejectedWith("VM Exception while processing transaction: revert");
        });
        
        it("Try getting discount silver coin under-price.", async function () {
            return expect(coins.createDiscountCoin(1, testFounderIndex, { value: toBigInt(prices[1] / 2 - 1) })).to.be.rejectedWith("VM Exception while processing transaction: revert");
        });

        it("Try getting discount gold coin under-price.", async function () {
            return expect(coins.createDiscountCoin(2, testFounderIndex, { value: toBigInt(prices[2] / 2 - 1) })).to.be.rejectedWith("VM Exception while processing transaction: revert");
        });

        it("Try getting discount diamond coin under-price.", async function () {
            return expect(coins.createDiscountCoin(3, testFounderIndex, { value: toBigInt(prices[3] / 2 - 1) })).to.be.rejectedWith("VM Exception while processing transaction: revert");
        });

        it("Try getting bronze coin under-price.", async function () {
            return expect(coins.createCoin(0, { value: toBigInt(prices[0] - 1) })).to.be.rejectedWith("VM Exception while processing transaction: revert");
        });

        it("Try getting silver coin under-price.", async function () {
            return expect(coins.createCoin(1, { value: toBigInt(prices[1] - 1) })).to.be.rejectedWith("VM Exception while processing transaction: revert");
        });

        it("Try getting gold coin under-price.", async function () {
            return expect(coins.createCoin(2, { value: toBigInt(prices[2] - 1) })).to.be.rejectedWith("VM Exception while processing transaction: revert");
        });

        it("Try getting diamond coin under-price.", async function () {
            return expect(coins.createCoin(3, { value: toBigInt(prices[3] - 1) })).to.be.rejectedWith("VM Exception while processing transaction: revert");
        });

        it("Try to approve blocked(denied) address.", async function () {
            await denyList.deny(account4);
            expect(await denyList.isDenied(account4)).to.equal(true);
            return expect(coins.approve(account4, 0)).to.be.rejectedWith("VM Exception while processing transaction: revert This contract is blocked!")
        })

        it("Try to approve for all blocked(denied) address.", async function () {
            return expect(coins.setApprovalForAll(account4, true)).to.be.rejectedWith("VM Exception while processing transaction: revert This contract is blocked!")
        })

    })

});

describe("-Ant Tests-", function () {

    it("Should init ants.", async function () {
        const Ants = await ethers.getContractFactory("Ants");
        ants = await Ants.deploy(coins.target, denyList.target);
    });

    let dnas = [
        [2, 38, 13, 0, 0, 0, 8, 0, 37, 3, 33, 5, 7, 22, 21, 0, 20, 3],
        [2, 37, 7, 13, 6, 2, 8, 0, 25, 3, 28, 4, 8, 21, 12, 4, 19, 3],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 20, 4, 3, 6, 0, 6, 0, 19, 1, 24, 0, 0, 0, 0, 0, 0, 2]
    ];
    let rarities = [
        [3, 7, 8, 0, 0, 0, 6, 0, 7, 5, 8, 4, 5, 7, 8, 0, 5, 6],
        [3, 7, 3, 7, 2, 3, 6, 0, 5, 5, 6, 3, 5, 7, 3, 4, 5, 6],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 4, 2, 2, 2, 0, 3, 0, 4, 3, 6, 0, 0, 0, 0, 0, 0, 4]
    ];

    describe("--Happy path tests--", function () {
        it("Create/check ants using all methods and confirm inventory.", async function () {
            await ants.addPromotionalAnt(dnas[0], owner, true);
            await ants.addPromotionalAnt(dnas[1], account1, false);
            await ants.connect(account1).createPromotionalAnt();
            await ants.connect(account2).createAnt(dnas[2], { value: toBigInt(99) });

            let coin0DiscountStatus = await ants.isDiscountUsedByCoin(0);
            expect(coin0DiscountStatus).to.equal(true);
            await ants.createDiscountAnt(0, dnas[3], { value: BigInt("76050000000000000") });
            coin0DiscountStatus = await ants.isDiscountUsedByCoin(0);
            expect(coin0DiscountStatus).to.equal(false);
            let owners = [owner, account1, account2, owner];
            for (let i = 0; i < 4; i++) {
                let ant = await ants.getAnt(i);
                let _owner = await ants.ownerOf(i);
                expect(_owner).to.equal(owners[i]);
                for (let j = 0; j < 18; j++) {
                    expect(ant.dna[j]).to.equal(dnas[i][j]);
                    expect(ant.rarities[j]).to.equal(rarities[i][j]);
                    expect(ant.antName).to.equal("");
                    expect(ant.isUnlocked).to.equal(false);
                    expect(ant.isRentLocked).to.equal(false);
                }
            }

            inventory0 = await ants.getPartInventory(0, 0)
            inventory1 = await ants.getPartInventory(0, 1)
            inventory2 = await ants.getPartInventory(2, 4)
            inventory3 = await ants.getPartInventory(2, 7)
            inventory4 = await ants.getPartInventory(1, 20)
            inventory5 = await ants.getPartInventory(8, 25)
            inventory6 = await ants.getPartInventory(6, 8) // minus 2 from inv
            inventory7 = await ants.getPartInventory(1, 38)
            inventory8 = await ants.getPartInventory(2, 13)

            expect(inventory0).to.equal(10000)
            expect(inventory1).to.equal(10000)
            expect(inventory2).to.equal(10000)
            expect(inventory3).to.equal(199)
            expect(inventory4).to.equal(83)
            expect(inventory5).to.equal(35)
            expect(inventory6).to.equal(16)
            expect(inventory7).to.equal(8)
            expect(inventory8).to.equal(2)
        });

        it("Confirm toggle functionality for ant lock.", async function () {
            await ants.toggleAntLock(0)
            await ants.connect(account1).toggleAntLock(1)

            let ant0 = await ants.getAnt(0)
            let ant1 = await ants.getAnt(1)

            expect(ant0.isUnlocked).to.equal(true)
            expect(ant1.isUnlocked).to.equal(true)

            await ants.toggleAntLock(0)
            await ants.connect(account1).toggleAntLock(1)

            ant0 = await ants.getAnt(0)
            ant1 = await ants.getAnt(1)

            expect(ant0.isUnlocked).to.equal(false)
            expect(ant1.isUnlocked).to.equal(false)
        })

        it("Confirm toggle functionality for rental lock.", async function () {
            await ants.toggleRental(0, true)
            await ants.toggleRental(1, true)

            let ant0 = await ants.getAnt(0)
            let ant1 = await ants.getAnt(1)

            expect(ant0.isRentLocked).to.equal(true)
            expect(ant1.isRentLocked).to.equal(true)

            await ants.toggleRental(0, true)
            await ants.toggleRental(1, true)

            ant0 = await ants.getAnt(0)
            ant1 = await ants.getAnt(1)

            expect(ant0.isRentLocked).to.equal(true)
            expect(ant1.isRentLocked).to.equal(true)

            await ants.toggleRental(0, false)
            await ants.toggleRental(1, false)

            ant0 = await ants.getAnt(0)
            ant1 = await ants.getAnt(1)

            expect(ant0.isRentLocked).to.equal(false)
            expect(ant1.isRentLocked).to.equal(false)

            await ants.toggleRental(0, false)
            await ants.toggleRental(1, false)

            ant0 = await ants.getAnt(0)
            ant1 = await ants.getAnt(1)

            expect(ant0.isRentLocked).to.equal(false)
            expect(ant1.isRentLocked).to.equal(false)
        })

        it("Unlock ant and commander transfer.", async function () {
            await ants.connect(account1).toggleAntLock(1)
            await ants.commanderTransfer(account1, account2, 1)
            let antOwner = await ants.ownerOf(1)
            expect(antOwner).to.equal(account2)

            await ants.connect(account2).toggleAntLock(1)
            let ant1 = await ants.getAnt(1)
            expect(ant1.isUnlocked).to.equal(false)

            await ants.connect(account2).toggleAntLock(1)
            ant1 = await ants.getAnt(1)
            expect(ant1.isUnlocked).to.equal(true)

            await ants.commanderTransfer(account2, account1, 1)
            antOwner = await ants.ownerOf(1)
            expect(antOwner).to.equal(account1)
        })

        it("Check, change and re-check ant name.", async function () {
            let ant = await ants.getAnt(1)
            expect(ant.antName).to.equal("")

            await ants.connect(account1).changeName(1, "Lars")

            ant = await ants.getAnt(1)
            expect(ant.antName).to.equal("Lars")
        })

        it("Change, check DNA.", async function () {
            // ant 1 ahould be unlocked
            await ants.connect(account2).toggleAntLock(0)
            await ants.changeDna(owner, 0, 0, BigInt("10101010101010101010101010101010101"))
            await ants.changeDna(account1, 1, 0, 0)

            let ant0 = await ants.getAnt(0)
            let ant1 = await ants.getAnt(1)

            expect(ant0.dna).to.equal(BigInt("10101010101010101010101010101010101"))
            expect(ant1.dna).to.equal(0)
        })

        it("Normal transfer for both locked and unlocked ant.", async function () {
            await ants.connect(account2).transferFrom(account2, account3, 2)

            expect(await ants.ownerOf(2)).to.equal(account3)

            await ants.connect(account3).toggleAntLock(2)

            expect((await ants.getAnt(2)).isUnlocked).to.equal(true)

            await ants.connect(account3).transferFrom(account3, account2, 2)

            expect(await ants.ownerOf(2)).to.equal(account2)
        })
        // commander transfer, ant lock, change name, toggle rental, change dna test, normal ant transfer
    });

    describe("--Failure testing--", function () {

        it("Try to create promotional ant with previous air drop.", async function () {
            return expect(ants.createPromotionalAnt()).to.be.rejectedWith("VM Exception while processing transaction: revert")
        })

        it("Try to create promotional ant with previous permission.", async function () {
            return expect(ants.connect(account1).createPromotionalAnt()).to.be.rejectedWith("VM Exception while processing transaction: revert")
        })

        it("Try to create promotional ant no permission.", async function () {
            return expect(ants.connect(account2).createPromotionalAnt()).to.be.rejectedWith("VM Exception while processing transaction: revert")
        })

        it("Try to create discount ant with previous permission.", async function () {
            return expect(ants.createDiscountAnt(0, dnas[3], { value: BigInt("76050000000000000") })).to.be.rejectedWith("VM Exception while processing transaction: revert")
        })

        it("Try to create discount ant under value.", async function () {
            return expect(ants.createDiscountAnt(1, dnas[3], { value: BigInt("76040000000000000") })).to.be.rejectedWith("VM Exception while processing transaction: revert")
        })

        it("Try to create ant under value.", async function () {
            return expect(ants.connect(account2).createAnt(dnas[2], { value: toBigInt(98) })).to.be.rejectedWith("VM Exception while processing transaction: revert")
        })

        // buy ant trait point issues for every discount level
        // try to sell out of parts and get more
        //try to unlock someone else's ant or change name
        // try to transfer while locked
        // try to change dna while locked
        // try changing state and transfering both ways

        it("Fail to rent because ant is locked.", async function () {
            expect((await ants.getAnt(0)).isUnlocked).to.equal(false)
            expect(await ants.ownerOf(0)).to.equal(owner)
            return expect(ants.toggleRental(0, true, owner)).to.be.rejectedWith("VM Exception while processing transaction: revert")
        })

        it("Fail to rent because called by non-commander.", async function () {
            expect((await ants.getAnt(1)).isUnlocked).to.equal(true)
            expect(await ants.ownerOf(1)).to.equal(account1)
            return expect(ants.connect(account1).toggleRental(1, true, account1)).to.be.rejectedWith("VM Exception while processing transaction: revert")
        })

        it("Fail to rent because owner not owner.", async function () {
            expect((await ants.getAnt(1)).isUnlocked).to.equal(true)
            expect(await ants.ownerOf(1)).to.equal(account1)
            return expect(ants.toggleRental(1, true, owner)).to.be.rejectedWith("VM Exception while processing transaction: revert")
        })

        it("Fail to commander transfer because ant is locked.", async function () {
            expect((await ants.getAnt(0)).isUnlocked).to.equal(false)
            expect(await ants.ownerOf(0)).to.equal(owner)
            return expect(ants.commanderTransfer(owner, account1, 0)).to.be.rejectedWith("VM Exception while processing transaction: revert")
        })

        it("Fail to commander transfer because called by non-commander", async function () {
            expect((await ants.getAnt(1)).isUnlocked).to.equal(true)
            expect(await ants.ownerOf(1)).to.equal(account1)
            return expect(ants.connect(account1).commanderTransfer(account1, owner, 1)).to.be.rejectedWith("VM Exception while processing transaction: revert")
        })

        it("Fail to commander transfer because ant state changed too recently (1 hour).", async function () {
            //find out what had its state changed and makw shure it isnt in previous tests
        })

        it("Fail to transfer because ant is rented, ant state changed too recently (48 hours).", async function () {
            return expect(ants.)
        })

    })

});
