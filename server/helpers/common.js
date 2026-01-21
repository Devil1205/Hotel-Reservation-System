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
const findBestFloor = (data, n) => {
    let bestFloor = null;
    let bestTime = Infinity;
    let bestRoomsNumbers = [];

    data.forEach((floor, floorIndex) => {
        // get occupied room numbers
        const rooms = floor
            .filter(r => r.occupied.status === false)
            .map(r => r.rno)
            .sort((a, b) => a - b);

        // skip if not enough rooms
        if (rooms.length < n) return;

        // sliding window to find minimum horizontal time
        for (let i = 0; i <= rooms.length - n; i++) {
            const time = rooms[i + n - 1] - rooms[i];

            if (
                time < bestTime ||
                (time === bestTime && floorIndex < bestFloor)
            ) {
                bestTime = time;
                bestFloor = floorIndex;
                bestRoomsNumbers = rooms.slice(i, i + n);
            }
        }
    });

    return bestFloor === null
        ? null
        : {
            bestFloor: bestFloor,
            bestTime: bestTime,
            bestRoomsNumbers: bestRoomsNumbers
        };
}

const getAllAvailableRooms = (data) => {
    const rooms = [];
    data.forEach((floor, floorIndex) => {
        floor.forEach(r => {
            if (r.occupied.status === false) {
                rooms.push({
                    floor: floorIndex,
                    rno: r.rno
                });
            }
        });
    });
    return rooms;
}

const selectRoomsAcrossFloors = (data, n) => {
    // 1. collect available rooms
    const rooms = [];
    data.forEach((floor, f) =>
        floor.forEach(r => {
            if (r.occupied.status === false) rooms.push({ floor: f, rno: r.rno });
        })
    );
    if (rooms.length < n) return null;

    // availability per floor
    const availCount = {};
    rooms.forEach(r => (availCount[r.floor] = (availCount[r.floor] || 0) + 1));
    const bestBaseFloor = Object.entries(availCount)
        .sort((a, b) => b[1] - a[1])[0][0];

    // helpers
    const combos = (arr, k, i = 0, cur = [], out = []) => {
        if (cur.length === k) return out.push([...cur]);
        for (; i < arr.length; i++) {
            cur.push(arr[i]);
            combos(arr, k, i + 1, cur, out);
            cur.pop();
        }
        return out;
    };

    const travelTime = (sel) => {
        const byFloor = {};
        let minF = 1e9, maxF = -1e9;
        sel.forEach(r => {
            minF = Math.min(minF, r.floor);
            maxF = Math.max(maxF, r.floor);
            (byFloor[r.floor] ||= []).push(r.rno);
        });
        let h = 0;
        for (const f in byFloor) {
            const a = byFloor[f];
            h += Math.max(...a) - Math.min(...a);
        }
        return h + (maxF - minF) * 2;
    };

    const valid = (sel) => {
        const floors = [...new Set(sel.map(r => r.floor))].sort((a, b) => a - b);
        for (let i = 1; i < floors.length; i++)
            if (floors[i] !== floors[i - 1] + 1) return false;

        const count = {};
        sel.forEach(r => (count[r.floor] = (count[r.floor] || 0) + 1));
        const dominant = Object.entries(count).sort((a, b) => b[1] - a[1])[0][0];
        return dominant == bestBaseFloor;
    };

    // 2. evaluate
    let best = null, bestTime = Infinity;
    for (const c of combos(rooms, n)) {
        if (!valid(c)) continue;
        const t = travelTime(c);
        if (t < bestTime) {
            bestTime = t;
            best = c;
        }
    }

    return { bestRooms: best, bestTime: bestTime };
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
    getNumOfOccupiedRooms,
    getNumberOfOccupiedRoomsByClient,
    getNumOfRooms,
    getFloorsWithAvailableRooms,
    findBestFloor,
    getAllAvailableRooms,
    selectRoomsAcrossFloors,
}