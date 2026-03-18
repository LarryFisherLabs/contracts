// I should do testing this way but fuck im just one man

exports.shouldHaveErc721jFunctions = function () {
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
}