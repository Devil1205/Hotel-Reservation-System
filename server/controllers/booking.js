const { MAX_BOOKINGS_PER_CLIENT } = require('../constants');
const fs = require('fs');
const rooms = JSON.parse(fs.readFileSync('./data/rooms.json', 'utf8'));
const { getNumberOfOccupiedRoomsByClient, getFloorsWithAvailableRooms, getFloorWithLeastHorizontalTravelTime, getNumOfAvailableRooms } = require('../helpers/common');

const createBooking = (req, res) => {
    const clientIp = req.ip;
    const {numOfRooms} = req.body;

    // validate the number of rooms
    if(numOfRooms > 5 || numOfRooms < 1) {
        return res.status(400).json({
            success: false,
            message: "Number of rooms must be between 1 and 5"
        });
    }

    // validate the number of bookings per client
    const existingBookings = getNumberOfOccupiedRoomsByClient(rooms, clientIp);
    if(existingBookings===MAX_BOOKINGS_PER_CLIENT) {
        return res.status(400).json({
            success: false,
            message: `You have already booked ${MAX_BOOKINGS_PER_CLIENT} rooms`
        });
    }

    // validate the number of available rooms
    const availableRooms = getNumOfAvailableRooms(rooms);
    if(availableRooms<numOfRooms) {
        return res.status(400).json({
            success: false,
            message: `Only ${availableRooms} rooms are available`
        });
    }

    // find all the floors with this much available rooms
    const floorsWithAvailableRooms = getFloorsWithAvailableRooms(rooms, numOfRooms);
    // if there are floors with this much available rooms, use horizontal travel time priority logic between them
    if(floorsWithAvailableRooms.length>0) {
        // get the floor with the least travel time
        const floorIndexWithLeastTravelTime = getFloorWithLeastHorizontalTravelTime(floorsWithAvailableRooms);
        const floorWithLeastTravelTime = floorsWithAvailableRooms[floorIndexWithLeastTravelTime];
        // book the rooms in the floor with the least travel time
        for(let i=0; i<numOfRooms; i++) {
            floorWithLeastTravelTime[i].occupied.status = true;
            floorWithLeastTravelTime[i].occupied.bookedBy = clientIp;
        }
        // save the rooms to the file
        fs.writeFileSync('./data/rooms.json', JSON.stringify(rooms, null, 2));
        return res.status(200).json({
            success: true,
            message: `Rooms booked successfully`,
        });
    }
    // if no floors with this much available rooms, use travel time priority logic
    else{

    }
}

module.exports = {
    createBooking
}