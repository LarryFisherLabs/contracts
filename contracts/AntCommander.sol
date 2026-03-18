// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

// AntCommander is the trusted commander contract for Ants.sol.
// It sits between the frontend/game and the NFT contract, enforcing
// business logic before delegating to Ants.sol functions.

// --- Responsibilities ---
// toggleRental: call when an ant's rentalCount changes between 0 and >0
//   (i.e. when an ant transitions from unrented to rented or back)
// commanderTransfer: used by the first-party marketplace to sell ants.
//   Rented ants CAN be sold - buyers are shown rental status before purchase.
//   TODO: Enforce a cooldown between rental end and marketplace sale eligibility.
//         e.g. require block.timestamp > rentalEnd + COOLDOWN before calling
//         commanderTransfer. This prevents an owner from ending a rental and
//         immediately selling without giving the market time to adjust pricing.
//         Currently there is a 1-hour cooldown after rental START (via timestamp
//         update in toggleRental) but no cooldown after rental END.
// changeDna: call when the game awards trait changes to an ant (owner must be
//   unlocked and ant must NOT be rented out). Commander passes the cooldown
//   duration so the game contract controls how frequently DNA can change.

// level
