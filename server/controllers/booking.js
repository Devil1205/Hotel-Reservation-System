const { MAX_BOOKINGS_PER_CLIENT } = require('../constants');
const fs = require('fs');
let rooms = JSON.parse(fs.readFileSync('./data/rooms.json', 'utf8'));
const { getFloorsWithAvailableRooms, getNumOfAvailableRooms, findBestFloor, getAllAvailableRooms, selectRoomsAcrossFloors } = require('../helpers/common');

// Get all rooms
const getRooms = (req, res) => {
    // Reload rooms from file to get latest state
    rooms = JSON.parse(fs.readFileSync('./data/rooms.json', 'utf8'));
    return res.status(200).json({
        success: true,
        data: rooms
    });
};

// Reset all bookings
const resetBookings = (req, res) => {
    // Reset all rooms to unoccupied
    rooms = rooms.map(floor => 
        floor.map(room => ({
            ...room,
            occupied: { status: false, bookedBy: null }
        }))
    );
    
    fs.writeFileSync('./data/rooms.json', JSON.stringify(rooms, null, 2));
    return res.status(200).json({
        success: true,
        message: 'All bookings have been reset',
        data: rooms
    });
};

// Random booking
const randomBooking = (req, res) => {
    // Reload rooms from file to get latest state
    rooms = JSON.parse(fs.readFileSync('./data/rooms.json', 'utf8'));
    
    // Reset all rooms first
    rooms = rooms.map(floor => 
        floor.map(room => ({
            ...room,
            occupied: { status: false, bookedBy: null }
        }))
    );
    
    // Randomly book some rooms (30-50% of total rooms)
    const totalRooms = rooms.reduce((acc, floor) => acc + floor.length, 0);
    const numToBook = Math.floor(totalRooms * (0.3 + Math.random() * 0.2));
    
    let bookedCount = 0;
    while (bookedCount < numToBook) {
        const floorIndex = Math.floor(Math.random() * rooms.length);
        const roomIndex = Math.floor(Math.random() * rooms[floorIndex].length);
        
        if (!rooms[floorIndex][roomIndex].occupied.status) {
            rooms[floorIndex][roomIndex].occupied.status = true;
            rooms[floorIndex][roomIndex].occupied.bookedBy = 'random';
            bookedCount++;
        }
    }
    
    fs.writeFileSync('./data/rooms.json', JSON.stringify(rooms, null, 2));
    return res.status(200).json({
        success: true,
        message: `Randomly booked ${numToBook} rooms`,
        data: rooms
    });
};

const createBooking = (req, res) => {
    // Reload rooms from file to get latest state
    rooms = JSON.parse(fs.readFileSync('./data/rooms.json', 'utf8'));
    
    const clientIp = req.ip;
    const { numOfRooms } = req.body;

    // validate the number of rooms
    if (numOfRooms > 5 || numOfRooms < 1) {
        return res.status(400).json({
            success: false,
            message: "Number of rooms must be between 1 and 5"
        });
    }

    // validate the number of available rooms
    const availableRooms = getAllAvailableRooms(rooms);
    if (availableRooms.length < numOfRooms) {
        return res.status(400).json({
            success: false,
            message: `Only ${availableRooms.length} rooms are available`
        });
    }

    // find all the floors with this much available rooms
    const floorsWithAvailableRooms = getFloorsWithAvailableRooms(rooms, numOfRooms);
    // if there are floors with this much available rooms, use horizontal travel time priority logic between them
    if (floorsWithAvailableRooms.length > 0) {
        // get the floor with the least travel time - pass original rooms array to get correct floor indices
        const result = findBestFloor(rooms, numOfRooms);
        
        if (result) {
            const { bestFloor, bestTime, bestRoomsNumbers } = result;
            
            // book the rooms in the floor with the least travel time
            for (let i = 0; i < numOfRooms; i++) {
                rooms[bestFloor][bestRoomsNumbers[i] - 1].occupied.status = true;
                rooms[bestFloor][bestRoomsNumbers[i] - 1].occupied.bookedBy = clientIp;
            }

            // save the rooms to the file
            fs.writeFileSync('./data/rooms.json', JSON.stringify(rooms, null, 2));
            return res.status(200).json({
                success: true,
                message: `Rooms booked successfully`,
                data: rooms
            });
        }
    }
    
    // if no floors with this much available rooms, use total travel time priority logic
    const crossFloorResult = selectRoomsAcrossFloors(rooms, numOfRooms);
    if (crossFloorResult && crossFloorResult.bestRooms) {
        const { bestRooms, bestTime } = crossFloorResult;
        for (let i = 0; i < numOfRooms; i++) {
            rooms[bestRooms[i].floor][bestRooms[i].rno-1].occupied.status = true;
            rooms[bestRooms[i].floor][bestRooms[i].rno-1].occupied.bookedBy = clientIp;
        }
        fs.writeFileSync('./data/rooms.json', JSON.stringify(rooms, null, 2));
        return res.status(200).json({
            success: true,
            message: `Rooms booked successfully with total travel time of ${bestTime}`,
            data: rooms
        });
    }
    
    return res.status(400).json({
        success: false,
        message: 'Unable to book rooms'
    });
}

module.exports = {
    createBooking,
    getRooms,
    resetBookings,
    randomBooking
}