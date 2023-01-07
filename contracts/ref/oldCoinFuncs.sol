// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

// function createCoin() external payable {
//     uint _discount = 0;
//     if (_isOnFounderList(msg.sender)) {
//         uint _founder = founderList[msg.sender];
//         uint _founderBools = uint8(_founder);
//         require(_founderBools>>1 == 1, "Mint founder coin first!");
//         if (_founderBools % 2 == 0) {
//             _discount = 2;
//         } else {
//             _discount = 1;
//         }
//     } else {
//         _discount = 1;
//     }
//     uint[4] memory _tiers = _discount == 2 ? _getTierPrices(true) : _getTierPrices(false);
//     require(msg.value >= _tiers[0], "Not enough Eth!");
//     uint _color = 0;
//     uint _value = msg.value * _discount;
//     if (msg.value >= _tiers[3]) {
//         _color = 3;
//     } else if (msg.value >= _tiers[2]) {
//         _color = 2;
//     } else if (msg.value >= _tiers[1]) {
//         _color = 1;
//     }
//     _createCoin(_value / 10**14, _color);
//     if (_discount == 2) {
//         founderList[msg.sender] |= 1;
//     }
// }