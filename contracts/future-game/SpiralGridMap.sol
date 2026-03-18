// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SpiralGridMap {
    // Grid dimensions
    uint256 constant GRID_SIZE = 10000;
    uint256 constant CENTER = GRID_SIZE / 2; // 5000,5000 is center
    
    // Struct to store coordinates
    struct Coordinate {
        uint256 x;
        uint256 y;
        bool isOccupied;
    }
    
    // Mapping to store occupied coordinates
    mapping(uint256 => mapping(uint256 => bool)) public occupiedSquares;
    // Array to keep track of occupied coordinates in order
    Coordinate[] public occupiedCoordinates;
    
    // Current spiral position tracking
    uint256 public currentRadius;
    uint256 public squaresOccupied;
    uint256 constant MAX_SQUARES = GRID_SIZE * GRID_SIZE;
    
    // Random number generator using block data
    function random(uint256 seed) private view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            seed,
            squaresOccupied
        )));
    }
    
    // Calculate occupancy probability based on distance from center
    function getOccupancyProbability(uint256 x, uint256 y) 
        private 
        pure 
        returns (uint256) 
    {
        // Calculate distance from center
        uint256 dx = x > CENTER ? x - CENTER : CENTER - x;
        uint256 dy = y > CENTER ? y - CENTER : CENTER - y;
        uint256 distance = dx > dy ? dx : dy; // Manhattan distance
        
        // Linear interpolation from 90% at center to 20% at edge
        uint256 maxDistance = CENTER;
        if (distance >= maxDistance) return 20; // 20% at edge
        
        // Scale from 90% to 20% based on distance
        uint256 probability = 90 - ((distance * 70) / maxDistance);
        return probability;
    }
    
    constructor() {
        // Initialize with center point
        occupiedSquares[CENTER][CENTER] = true;
        occupiedCoordinates.push(Coordinate(CENTER, CENTER, true));
        squaresOccupied = 1;
        currentRadius = 1;
    }
    
    function occupyNextSquare() public returns (bool) {
        if (squaresOccupied >= MAX_SQUARES || currentRadius >= CENTER) {
            return false; // Grid full or max radius reached
        }
        
        // Spiral coordinates calculation
        int256 x = int256(CENTER);
        int256 y = int256(CENTER);
        
        // Calculate position in current spiral layer
        uint256 layerSize = currentRadius * 8; // Perimeter of current square
        uint256 position = squaresOccupied % layerSize;
        
        // Move through spiral arms
        if (position < currentRadius * 2) {
            x += int256(position);
            y -= int256(currentRadius);
        } else if (position < currentRadius * 4) {
            x += int256(currentRadius);
            y -= int256(currentRadius - (position - currentRadius * 2));
        } else if (position < currentRadius * 6) {
            x += int256(currentRadius - (position - currentRadius * 4));
            y += int256(currentRadius);
        } else {
            x -= int256(currentRadius);
            y += int256(currentRadius - (position - currentRadius * 6));
        }
        
        // Check bounds
        if (x < 0 || x >= int256(GRID_SIZE) || y < 0 || y >= int256(GRID_SIZE)) {
            currentRadius++;
            return occupyNextSquare(); // Try next position
        }
        
        uint256 ux = uint256(x);
        uint256 uy = uint256(y);
        
        // Skip if already occupied
        if (occupiedSquares[ux][uy]) {
            squaresOccupied++;
            return occupyNextSquare(); // Try next position
        }
        
        // Determine if square should be occupied based on probability
        uint256 probability = getOccupancyProbability(ux, uy);
        uint256 randomVal = random(squaresOccupied) % 100;
        
        if (randomVal < probability) {
            occupiedSquares[ux][uy] = true;
            occupiedCoordinates.push(Coordinate(ux, uy, true));
        }
        
        squaresOccupied++;
        
        // Move to next radius when completing a layer
        if (squaresOccupied % layerSize == 0) {
            currentRadius++;
        }
        
        return true;
    }
    
    // Helper function to get total occupied squares
    function getOccupiedCount() public view returns (uint256) {
        return occupiedCoordinates.length;
    }
    
    // Helper function to check if a square is occupied
    function isSquareOccupied(uint256 x, uint256 y) 
        public 
        view 
        returns (bool) 
    {
        return occupiedSquares[x][y];
    }
}

/* This implementation includes:

Data Structure:
Uses a Coordinate struct to store x, y coordinates and occupancy status
A 2D mapping occupiedSquares for O(1) lookup of occupied status
An array occupiedCoordinates to maintain the list of occupied squares
Spiral Occupation Function:
Starts from center (5000,5000)
Spirals outward in square layers
Implements variable density (90% at center to 20% at edges)
Uses pseudo-random number generation for semi-random unoccupied squares
Stops when reaching grid boundaries
Key Features:
getOccupancyProbability: Calculates occupancy chance based on distance from center
random: Simple pseudo-random number generator using blockchain data
Spiral algorithm that moves in square patterns outward
Boundary checking to prevent overflow
Automatic radius increase when completing each spiral layer
Helper Functions:
getOccupiedCount: Returns total occupied squares
isSquareOccupied: Checks if a specific coordinate is occupied
To use this contract:

Deploy it
Call occupyNextSquare() repeatedly to fill the grid
Use isSquareOccupied(x,y) to check specific coordinates
Monitor progress with getOccupiedCount()
Note: This is gas-intensive due to storage operations. For production use, you might want to:

Batch multiple occupations in one transaction
Use events instead of storing all coordinates
Optimize storage patterns
Add access controls
The spiral pattern will fill approximately 90% near the center, gradually dropping to 20% at the edges, with unoccupied squares distributed semi-randomly based on the probability function. 
*/

/* Help me write solidity code including a data structure and a function. I want the data structure to represent occupied squares on a 10,000 x 10,000 2 dimensional grid map. The function will be used to occupy the squares of the grid map. Each time the function is called a new square will be occupied with its coordinates recorded by the data structure. The function will start by occupying the center of the map and spiral outward. Initially, occupied spaces should account for around 90% of grid map squares with around a 10% chance of a square being left empty. As occupied squares get further from the center that 90% density should drop steadily with the density of the outer ring at around 20%. The placement of unrecorded, unoccupied squares should be semi random. The occupied spaces will be created in a spiral so there will be an increasing radius of where new occupied spaces get placed. Once this radius goes beyond the edge of the grid map no new spaces can be occupied meaning the corners of the map will not get populated beyond this final radius. */