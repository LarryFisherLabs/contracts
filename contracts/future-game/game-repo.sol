// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

// !!!  !!!  !!!  !!!  !!!  !!!  !!!  !!!  !!!  !!!  !!!  !!!  !!!  !!!  !!!  !!!  !!!

// !!! This might be part of the Commander contract for the ants contract or part !!!
// !!! of the game contract concept for starknet or bits and peices of both.      !!!

// !!! #A#: When an ant's rentalCount switches state between !!!
// !!! '0' and '> 0' the ant's contract must be notified.    !!!

// !!! #B#: Everytime a level is added to in the levels mapping the ants totalLevels gets !!!
// !!! added to as well. The antLevel also gets added to similarly but using an equation  !!!
// !!! such that when totalLevels for the ant is low antLevel increases quickly but over  !!!
// !!! time slows down significantly and does not get to maximum of 255 til all levels in !!!
// !!! levels mapping are 255(indicated by the ant's totalLevels).                        !!!

// !!! #C#: This text will need updating !!!

// !!!  !!!  !!!  !!!  !!!  !!!  !!!  !!!  !!!  !!!  !!!  !!!  !!!  !!!  !!!  !!!  !!!
contract game {
    // Meta data for each world for each ant
    struct WorldMeta {
        uint24 cityId;
        uint48 lastMoved;
        uint48 rentalStart;
        uint48 rentalEnd;
        address renter;
    }

    struct GameAntMeta {
        // !!! #A# !!!
        uint16 rentalCount;

        // !!! #B# !!!
        uint16 totalLevels;
        
        uint16 antLevel;
        // uint48 lastDnaChange;
        // uint120 dna;
        // string name;


        // !!! #C# !!!
        // Levels will be kept track of in the game contract(as well as ants contract on main net)
        // and can be optionally updated on main net.
        // The same could be true of the above 3 commented variables but does not seem neccessary
        // here.
        // Sidenote: DNA might be necessary in both contracts but for now I'm thinking the ant dna
        // will be evaluated as needed and increase certain village stats/levels.
        mapping(uint8 => uint8) levels;

        mapping(uint16 => WorldMeta) worldMeta;
    }

    mapping(uint16 => GameAntMeta) gameAntMetas;

    event RentalUpdate(address indexed owner, uint indexed worldId, address indexed renter, uint rentalEnd);
    event AntMovement(address indexed moverAddress, uint indexed worldId, uint indexed antId, uint cityId, uint time);

    function _removeRental(uint16 _antId, uint16 _worldId) private {
        WorldMeta memory _worldMeta = gameAntMetas[_antId].worldMeta[_worldId];
        require(_worldMeta.rentalEnd < block.timestamp, "Rental still active!");
        gameAntMetas[_antId].worldMeta[_worldId].renter = address(0);
        gameAntMetas[_antId].worldMeta[_worldId].rentalStart = 0;
        gameAntMetas[_antId].worldMeta[_worldId].rentalEnd = 0;
        gameAntMetas[_antId].worldMeta[_worldId].cityId = 0;
        gameAntMetas[_antId].worldMeta[_worldId].lastMoved = 0;
        gameAntMetas[_antId].rentalCount--;
    }

    // function manageAntStation(address _sender, uint16 _antId, uint16 _worldId, uint24 _cityId, uint _coolDownTime) external {
    //     require(msg.sender == commander, "Commander only!");
    //     uint48 blockTime = block.timestamp;
    //     address antOwner = ownerOf(_antId);
    //     if (_cityId > 0) require((antMetas[_antId].worldMeta[_worldId].lastMoved + _coolDownTime) < blockTime, "Ant has been moved too recently!");
    //     if (_sender == antOwner) {
    //         if (antMetas[_antId].worldMeta[_worldId].rentalMeta.renter != address(0)) _removeRental(_antId, _worldId);
    //         require(antMetas[_antId].worldMeta[_worldId].rentalMeta.renter == address(0), "Ant is rented on this world!");
    //         antMetas[_antId].worldMeta[_worldId].cityId = _cityId;
    //         if (_cityId > 0) antMetas[_antId].worldMeta[_worldId].lastMoved = blockTime;
    //     } else {
    //         require(antMetas[_antId].worldMeta[_worldId].rentalMeta.renter == _sender, "Not NFT owner or renter!");
    //         antMetas[_antId].worldMeta[_worldId].cityId = _cityId;
    //         if (_cityId > 0) antMetas[_antId].worldMeta[_worldId].lastMoved = blockTime;
    //     }
    //     // emit AntMovement(antOwner, _sender, _worldId, _antId, _cityId, blockTime);
    // }

    // function manageAntRental(address _sender, uint16 _antId, address _renter, uint48 _duration) external {
    //     require(msg.sender == commander, "Commander only!");
    //     RentalMeta memory _rentalMeta = antMetas[_antId].rentalMeta;
    //     if (_sender == ownerOf(_antId)) {

    //     } else if (_rentalMeta.)
    //     require(_sender ==  || (_sender == _rentalMeta.renter), "Not owner!");
    //     if (_renter == address(0)) {
    //         require(_rentalMeta.renter != address(0), "Already unrented!");
    //         require(_rentalMeta)
    //     }
    //     antMetas[_antId].renter = _renter;
    // }


    // function getGameDetails(uint16 _antId) external view returns (uint worldId, uint cityId, uint lastChanged, uint lastMoved) {
    //     worldId = antMetas[_antId].worldId;
    //     cityId = antMetas[_antId].cityId;
    //     lastChanged = antMetas[_antId].lastChanged;
    //     lastMoved = antMetas[_antId].lastMoved;
    // }

    // commander must calculate dna change cool down and pass it to dna change function
    // commander must check ant levels for dna updates before calling ant contract
}
