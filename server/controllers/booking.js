const { MAX_BOOKINGS_PER_CLIENT } = require('../constants');
const fs = require('fs');
const rooms = JSON.parse(fs.readFileSync('./data/rooms.json', 'utf8'));
const { getFloorsWithAvailableRooms, getNumOfAvailableRooms, findBestFloor, getAllAvailableRooms, selectRoomsAcrossFloors } = require('../helpers/common');

const createBooking = (req, res) => {
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
        // get the floor with the least travel time
        const { bestFloor, bestTime, bestRoomsNumbers } = findBestFloor(floorsWithAvailableRooms, numOfRooms);

        // book the rooms in the floor with the least travel time
        for (let i = 0; i < numOfRooms; i++) {
            rooms[bestFloor][bestRoomsNumbers[i]].occupied.status = true;
            rooms[bestFloor][bestRoomsNumbers[i]].occupied.bookedBy = clientIp;
        }

        // save the rooms to the file
        fs.writeFileSync('./data/rooms.json', JSON.stringify(rooms, null, 2));
        return res.status(200).json({
            success: true,
            message: `Rooms booked successfully`,
        });
    }
    // if no floors with this much available rooms, use total travel time priority logic
    else {
        const { bestRooms, bestTime } = selectRoomsAcrossFloors(rooms, numOfRooms);
        for (let i = 0; i < numOfRooms; i++) {
            rooms[bestRooms[i].floor][bestRooms[i].rno-1].occupied.status = true;
            rooms[bestRooms[i].floor][bestRooms[i].rno-1].occupied.bookedBy = clientIp;
        }
        fs.writeFileSync('./data/rooms.json', JSON.stringify(rooms, null, 2));
        return res.status(200).json({
            success: true,
            message: `Rooms booked successfully with total travel time of ${bestTime}`,
        });
    }
}

module.exports = {
    createBooking
}