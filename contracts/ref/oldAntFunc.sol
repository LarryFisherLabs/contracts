// function updateRarityPriceScale(uint _index, uint16 _newPriceScale) external onlyOwner {
//     priceScaleByRarity[_index] = _newPriceScale;
// }





    // struct AntMeta {
    //     bool isRented;
    //     bool isAntUnlocked;
    //     uint48 lastStateChange;
    //     uint120 dna;
    //     bytes name;
    // }




    // function updateMinPartFee(uint _minFee) external onlyOwner {
    //     minPartFee = uint64(_minFee);
    // }

    // function updateNameFee(uint _nameFee) external onlyOwner {
    //     nameFee = uint64(_nameFee);
    // }

    // function getDnaPrice(uint[18] memory _dna, uint _discountIndex) external view returns (uint price) {
    //     require(_discountIndex < 6, "Discount index out of bounds!");
    //     price = _getDnaPrice(_dna, _discountIndex);
    // }

    //     function levelUp(uint _antId, uint _levelId, uint _levelIncr) external {
    //     require(msg.sender == commander, "Commander only!");
    //     uint newLevel = antMetas[uint16(_antId)].levels[uint8(_levelId)] + _levelIncr;
    //     if (newLevel > 255) {
    //         _levelIncr -= (newLevel - 255);
    //         newLevel = 255;
    //     }
    //     antMetas[uint16(_antId)].levels[uint8(_levelId)] = uint8(newLevel);
    //     uint newTotalLevels = antMetas[uint16(_antId)].totalLevels + _levelIncr;
    //     uint antLevel;
    //     if (newTotalLevels < 21) antLevel = newTotalLevels; //0-20 0-20
    //     else if (newTotalLevels < 101) antLevel = 10 + newTotalLevels / 2; //20-60 21-100
    //     else if (newTotalLevels < 1021) antLevel = 57 + newTotalLevels / 30; //60-91 101-1020
    //     else if (newTotalLevels < 20001) antLevel = 86 + newTotalLevels / 200; //91-186 1021-20000
    //     else antLevel = 156 + 69 * newTotalLevels / 45280; //186-255 20001-65280
    //     antMetas[uint16(_antId)].totalLevels = uint16(newTotalLevels);
    //     if (antMetas[uint16(_antId)].antLevel != antLevel) antMetas[uint16(_antId)].antLevel = uint8(antLevel);
    //     emit LevelUpdate(_antId, _levelId, newLevel, newTotalLevels, antLevel);
    // }



// AntParts

    // uint constant FACE_ACC_LAYER = 4; // incomp w/ gas-masks, cold-weather-mask, and (shrouded) (1)
    // uint constant COLD_WEATHER_MASK = 8; // incomp w/ mouth-acc and face-acc (2)

    // gas-mask
    // uint constant GAS_MASK = 9; // incomp w/ mouth-acc, optical, and face-acc (3)
    // uint constant PAINT_GAS_MASK = 11; // incomp w/ mouth-acc, optical, and face-acc (3)
    // uint constant GAS_MASK_BONG = 13; // incomp w/ mouth-acc, optical, and face-acc (3)

    // uint constant GOLD_TAGS = 8;






    // _checkDna inside last else statement

        // if (
        //     _dna[FACE_GEAR_LAYER] == GAS_MASK ||
        //     _dna[FACE_GEAR_LAYER] == PAINT_GAS_MASK ||
        //     _dna[FACE_GEAR_LAYER] == GAS_MASK_BONG
        // ) require(_dna[OPTICAL_LAYER] == 0, "Gas mask incompatible with optical!");

        // if (
        //     _dna[FACE_ACC_LAYER] != 0 && (
        //         _dna[FACE_GEAR_LAYER] == COLD_WEATHER_MASK ||
        //         _dna[FACE_GEAR_LAYER] == GAS_MASK ||
        //         _dna[FACE_GEAR_LAYER] == PAINT_GAS_MASK ||
        //         _dna[FACE_GEAR_LAYER] == GAS_MASK_BONG
        //     )
        // ) revert("Face accessories and face gear that covers face incompatible!");





// !!! layer ids for incompatibility !!!

// uint constant ANTENNA_LAYER = 0; // non 0 incomp w/ tall-head-gear
// uint constant HEAD_GEAR_LAYER = 1;
// uint constant FACE_GEAR_LAYER = 2; // (incomp w/ eod and shrouded)
// uint constant OPTICAL_LAYER = 3; // incomp w/ gas-masks, and (shrouded)
// uint constant MOUTH_ACC_LAYER = 5; // incomp w/ (eod), (shrouded), select-face-gear
// uint constant NECK_LAYER = 6;
// uint constant BANDOLIER_LAYER = 7; // incomp w/ (eod)
// uint constant BODY_GEAR_LAYER = 8;

// // !!! part ids for incompatibility !!!

// // ! antenna !
// uint constant TIED_ANTENNA = 1; // incomp w/ trucker and (shrouded)

// // ! head-gear !
// // helms
// uint constant RACING_HELM = 11; // next three incomp with face gear, mout and optical
// uint constant FLAME_HELM = 22;
// uint constant WELD_HELM = 36;
// uint constant EOD_HELM = 19; // eod must be paired incomp w/ shemagh, mouth-acc, bandolier, face-gear, and select-optical
// uint constant SHROUDED_HELM = 39; // incomp w/ (tied antenna, face-gear, non-base-dog-tags, mouth-acc, face-acc, optical) 
// // mid-head-gear
// uint constant TRUCKER_CAP = 7; // incomp w/ tied antenna
// uint constant RACING_HELMET = 11; // incomp w/ tied antenna
// uint constant FLAMED_RACING_HELMET = 22; // incomp w/ tied antenna
// uint constant BLACK_TRUCKER_CAP = 29; // incomp w/ tied antenna
// uint constant CAT_HELMET = 30; // incomp w/ tied antenna
// // tall-head-gear
// uint constant UNI_HAT = 21; // incomp w/ non-0-antenna
// uint constant CHEF_HAT = 27; // incomp w/ non-0-antenna
// uint constant UNCLE_SAM_HAT = 28; // incomp w/ non-0-antenna

// // ! face-gear !
// // allowed-with-mouth-acc
// uint constant EMPTY_FACE_GEAR = 0;
// uint constant BALACLAVA = 3;
// uint constant BANDITO_BALACLAVA = 7;

// // ! max optical id allowed with eod !
// uint constant EYE_PATCH = 1;
// // maybe new opticals

// // ! neck-gear !
// // tag-before-shemaghs
// uint constant ALT_TAGS = 1;
// // non-base-dog-tags
// uint constant ANCIENT_TAGS = 7;

// // ! body-gear !
// uint constant EOD_BODY = 18;

        //function _checkDna(uint[18] memory _dna) internal view {
    //     for (uint i; i < 18; ++i) {
    //         require(_dna[i] < layerCount[i], "Invalid DNA!");
    //         if ((i < 9) && (0 < incompatibleMap[i * 10 + _dna[i]])) {

    //         }
    //     }
    //     if (
    //         _dna[HEAD_GEAR_LAYER] == EOD_HELM || _dna[BODY_GEAR_LAYER] == EOD_BODY
    //     ) {
    //         if (
    //             (_dna[HEAD_GEAR_LAYER] != EOD_HELM) || (_dna[BODY_GEAR_LAYER] != EOD_BODY) ||
    //             (_dna[FACE_GEAR_LAYER] != 0) ||
    //             (_dna[MOUTH_ACC_LAYER] != 0) ||
    //             (_dna[BANDOLIER_LAYER] != 0) ||
    //             (_dna[OPTICAL_LAYER] > EYE_PATCH) ||
    //             (ALT_TAGS < _dna[NECK_LAYER] && _dna[NECK_LAYER] < ANCIENT_TAGS)
    //         ) revert("EOD issue!");
    //     } else if (_dna[HEAD_GEAR_LAYER] == SHROUDED_HELM) {
    //         if (
    //             (_dna[ANTENNA_LAYER] == TIED_ANTENNA) ||
    //             (_dna[FACE_GEAR_LAYER] != 0) ||
    //             (_dna[OPTICAL_LAYER] > EYE_PATCH) ||
    //             (_dna[MOUTH_ACC_LAYER] != 0)
    //         ) revert("Shrouded helm issue!");
    //     } else if (
    //         _dna[HEAD_GEAR_LAYER] == RACING_HELM ||
    //         _dna[HEAD_GEAR_LAYER] == FLAME_HELM ||
    //         _dna[HEAD_GEAR_LAYER] == WELD_HELM
    //     ) {
    //         if (
    //             (_dna[FACE_GEAR_LAYER] != 0) ||
    //             (_dna[MOUTH_ACC_LAYER] != 0) ||
    //             (_dna[OPTICAL_LAYER] > EYE_PATCH)
    //         ) revert ("Helmet issue!");
    //     }
    //     else {
    //         if (
    //             (
    //                 (_dna[MOUTH_ACC_LAYER] != 0) && !(
    //                     _dna[FACE_GEAR_LAYER] == EMPTY_FACE_GEAR ||
    //                     _dna[FACE_GEAR_LAYER] == BALACLAVA ||
    //                     _dna[FACE_GEAR_LAYER] == BANDITO_BALACLAVA
    //                 )
    //             ) ||
    //             (
    //                 (0 < _dna[ANTENNA_LAYER]) && (
    //                     _dna[HEAD_GEAR_LAYER] == UNI_HAT ||
    //                     _dna[HEAD_GEAR_LAYER] == CHEF_HAT ||
    //                     _dna[HEAD_GEAR_LAYER] == UNCLE_SAM_HAT
    //                 )
    //             ) || 
    //             (
    //                 (_dna[ANTENNA_LAYER] == TIED_ANTENNA) && (
    //                     _dna[HEAD_GEAR_LAYER] == TRUCKER_CAP ||
    //                     _dna[HEAD_GEAR_LAYER] == RACING_HELMET ||
    //                     _dna[HEAD_GEAR_LAYER] == FLAMED_RACING_HELMET ||
    //                     _dna[HEAD_GEAR_LAYER] == BLACK_TRUCKER_CAP ||
    //                     _dna[HEAD_GEAR_LAYER] == CAT_HELMET
    //                 )
    //             )
                
    //         ) revert("Misc");
    //     }
    // }







    //     function getRarityPrices(uint _discountIndex) external view returns (uint[8] memory prices) {
    //     require(_discountIndex < 6, "Discount index out of bounds!");
    //     uint ratio = (_discountIndex < 5) ? (100 - 10 * _discountIndex) : 20;
    //     for (uint i; i < 8; ++i) {
    //         prices[i] = priceScaleByRarity[i] * minPartFee;
    //         if (0 < _discountIndex) prices[i] = prices[i] * ratio / 100;
    //     }
    // }