const getNumOfAvailableRooms = (rooms) => {
    const count = rooms.reduce((acc, room) => { return acc + room.filter(item => item.occupied.status === false).length }, 0);
    return count;
}
const getNumOfOccupiedRooms = (rooms) => {
    const count = rooms.reduce((acc, room) => { return acc + room.filter(item => item.occupied.status === true).length }, 0);
    return count;
}
const getNumberOfOccupiedRoomsByClient = (rooms, clientIp) => {
    const count = rooms.reduce((acc, room) => { return acc + room.filter(item => item.occupied.status === true && item.occupied.bookedBy === clientIp).length }, 0);
    return count;
}
const getNumOfRooms = (rooms) => {
    const count = rooms.reduce((acc, room) => { return acc + room.length }, 0);
    return count;
}
const getFloorsWithAvailableRooms = (rooms, numOfRooms) => {
    return rooms.filter(floor => floor.filter(room => room.occupied.status === false).length >= numOfRooms);
}
const getFloorWithLeastHorizontalTravelTime = (floors) => {
    let minTravelTime = Infinity;
    let floorIndexWithLeastTravelTime = -1;
    for(let i=0; i<floors.length; i++) {
        let travelTime = 0;
        for(let j=0; j<floors[i].length-1; j++) {
            travelTime += Math.abs(floors[i][j].rno - floors[i][j+1].rno);
        }
        if(travelTime<minTravelTime) {
            minTravelTime = travelTime;
            floorIndexWithLeastTravelTime = i;
        }
    }
    return floorIndexWithLeastTravelTime;
}
const generateSampleRoomData = (numOfRooms, roomsPerFloor) => {
    const rooms = [];

    const numOfFloors = Math.ceil(numOfRooms / roomsPerFloor);
    for (let i = 0; i < numOfFloors; i++) {
        const floor = [];
        for (let j = 0; j < roomsPerFloor; j++) {
            if (numOfRooms > 0) {
                floor.push({
                    rno: j + 1,
                    occupied: { status: false, bookedBy: null }
                });
                numOfRooms--;
            }
        }
        rooms.push(floor);
    }
    return rooms;
}

module.exports = {
    getNumOfAvailableRooms,
    getNumOfOccupiedRooms,
    getNumberOfOccupiedRoomsByClient,
    getNumOfRooms,
    getFloorsWithAvailableRooms,
    getFloorWithLeastHorizontalTravelTime,
}