// Shared state for serverless functions
// Note: This resets on cold starts. For production, use a database like Vercel KV, MongoDB, or PostgreSQL

let rooms = null;

// Generate initial room data (10 floors, 10 rooms each, last floor has 7)
export const generateInitialRooms = () => {
  const data = [];
  for (let floor = 0; floor < 10; floor++) {
    const roomsPerFloor = floor === 9 ? 7 : 10;
    const floorRooms = [];
    for (let room = 1; room <= roomsPerFloor; room++) {
      floorRooms.push({
        rno: room,
        occupied: { status: false, bookedBy: null }
      });
    }
    data.push(floorRooms);
  }
  return data;
};

export const getRooms = () => {
  if (rooms === null) {
    rooms = generateInitialRooms();
  }
  return rooms;
};

export const setRooms = (newRooms) => {
  rooms = newRooms;
};

// Helper functions
export const getFloorsWithAvailableRooms = (rooms, numOfRooms) => {
  return rooms.filter(floor => floor.filter(room => room.occupied.status === false).length >= numOfRooms);
};

export const getAllAvailableRooms = (data) => {
  const availableRooms = [];
  data.forEach((floor, floorIndex) => {
    floor.forEach(r => {
      if (r.occupied.status === false) {
        availableRooms.push({
          floor: floorIndex,
          rno: r.rno
        });
      }
    });
  });
  return availableRooms;
};

export const findBestFloor = (data, n) => {
  let bestFloor = null;
  let bestTime = Infinity;
  let bestRoomsNumbers = [];

  data.forEach((floor, floorIndex) => {
    const availableRooms = floor
      .filter(r => r.occupied.status === false)
      .map(r => r.rno)
      .sort((a, b) => a - b);

    if (availableRooms.length < n) return;

    for (let i = 0; i <= availableRooms.length - n; i++) {
      const time = availableRooms[i + n - 1] - availableRooms[i];

      if (time < bestTime || (time === bestTime && floorIndex < bestFloor)) {
        bestTime = time;
        bestFloor = floorIndex;
        bestRoomsNumbers = availableRooms.slice(i, i + n);
      }
    }
  });

  return bestFloor === null
    ? null
    : { bestFloor, bestTime, bestRoomsNumbers };
};

export const selectRoomsAcrossFloors = (data, n) => {
  const rooms = [];
  data.forEach((floor, f) =>
    floor.forEach(r => {
      if (r.occupied.status === false) rooms.push({ floor: f, rno: r.rno });
    })
  );
  if (rooms.length < n) return null;

  const availCount = {};
  rooms.forEach(r => (availCount[r.floor] = (availCount[r.floor] || 0) + 1));
  const bestBaseFloor = Object.entries(availCount).sort((a, b) => b[1] - a[1])[0][0];

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

  let best = null, bestTime = Infinity;
  for (const c of combos(rooms, n)) {
    if (!valid(c)) continue;
    const t = travelTime(c);
    if (t < bestTime) {
      bestTime = t;
      best = c;
    }
  }

  return { bestRooms: best, bestTime };
};
