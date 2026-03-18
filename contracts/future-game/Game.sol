// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract Game {
    uint public constant HQ = 0;
    uint public constant BARRACKS = 1;
    uint public constant TIMBERCAMP = 2;
    uint public constant CLAYPIT = 3;
    uint public constant IRONMINE = 4;
    uint public constant FARM = 5;
    uint public constant WAREHOUSE = 6;
    uint public constant WALL = 7;
    // uint public constant STABLE = 2;
    // uint public constant WORKSHOP = 3;
    // uint public constant HOLYSITE = 4;
    // uint public constant ACADEMY
    // SMITHY
    // RALLYPOINT
    // MONUMENT
    // MARKET
    // VAULT
    // WATCHTOWER
    uint public constant BUILDINGCOUNT = 8;

    struct Village {
        uint8 xCoord;
        uint8 yCoord;
        uint16 population;
        uint24 woodStock;
        uint24 clayStock;
        uint24 ironStock;
        address villageOwner;
        uint48 lastResourceCheck;
        uint8[BUILDINGCOUNT] lvls;
    }

    // decided not to include min levels but hq warehouse and farm cannot go below 1
    uint8[BUILDINGCOUNT] maxLvlsBuilding = [30, 25, 30, 30, 30, 30, 30, 20];
    uint16[BUILDINGCOUNT] woodReqBuilding = [90, 200, 50, 65, 75, 45, 60, 50];
    uint16[BUILDINGCOUNT] clayReqBuilding = [80, 170, 60, 50, 65, 40, 50, 100];
    uint16[BUILDINGCOUNT] ironReqBuilding = [70, 90, 40, 40, 70, 30, 40, 20];
    uint16[BUILDINGCOUNT] popReqBuilding = [5, 7, 5, 10, 10, 0, 0, 5];

    // divided by 1000
    uint16[BUILDINGCOUNT] woodFactorReqBuilding = [1260, 1260, 1250, 1270, 1252, 1300, 1265, 1260];
    uint16[BUILDINGCOUNT] clayFactorReqBuilding = [1275, 1280, 1275, 1265, 1275, 1320, 1270, 1275];
    uint16[BUILDINGCOUNT] ironFactorReqBuilding = [1260, 1260, 1245, 1240, 1240, 1290, 1245, 1260];
    uint16[BUILDINGCOUNT] popFactorReqBuilding = [1170, 1170, 1155, 1140, 1170, 1000, 1150, 1170];

    // in minutes
    // build time factor 1.2
    uint8[BUILDINGCOUNT] baseBuildTime = [15, 30, 15, 15, 18, 20, 17, 60];

    // building reqs
    // baracks hq lvl 3
    // wall baracks lvl 1

    // level up ratio and base
    // hq .96 95% speed factor
    // baracks .95 63% speed factor
    // resource 1.164 30 rph (rph: resource per hour)
    // farm 1.1722 240 pop
    // warehouse 1.2295 1000 resource
    // wall 1.2 4%
    uint16[BUILDINGCOUNT] buildingBaseStats = [95, 63, 30, 30, 30, 240, 1000, 4];
    // divide ratios by 1000 to get percent
    uint16[BUILDINGCOUNT] buildingStatRatio = [9600, 9500, 11640, 11722, 12295, 12000];

    mapping(address => uint) userVillageCounts;
    mapping(uint => Village) villages;
    mapping(uint => mapping(uint => uint)) worldMap;

    // constructor {
    // }

    function _getStocks(Village memory ref) private view returns (uint woodStock, uint clayStock, uint ironStock) {
        uint _timeDif = block.timestamp - ref.lastResourceCheck;
        woodStock = ref.woodStock + _timeDif * rphByLvl[ref.lvls[TIMBERCAMP]] / 60 / 60;
        clayStock = ref.clayStock + _timeDif * rphByLvl[ref.lvls[CLAYPIT]] / 60 / 60;
        ironStock = ref.ironStock + _timeDif * rphByLvl[ref.lvls[IRONMINE]] / 60 / 60;
    }

    function newVillage() external returns (uint newVillageIndex) {
        require(userVillageCounts[msg.sender] == 0);
        
    }

    function getResourceInfo(uint villageId) public view returns (uint woodStock, uint clayStock, uint ironStock, uint woodProduction, uint clayProduction, uint ironProduction, uint timestamp) {
        Village memory ref = villages[villageId];
        (woodStock, clayStock, ironStock) = _getStocks(ref);
        timestamp = block.timestamp;
        woodProduction = rphByLvl[ref.lvls[TIMBERCAMP]];
        clayProduction = rphByLvl[ref.lvls[CLAYPIT]];
        ironProduction = rphByLvl[ref.lvls[IRONMINE]];
    }
}