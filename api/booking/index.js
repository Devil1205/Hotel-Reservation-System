import { 
  getRooms, 
  setRooms, 
  getFloorsWithAvailableRooms, 
  getAllAvailableRooms, 
  findBestFloor, 
  selectRoomsAcrossFloors 
} from '../_shared/state.js';

// POST /api/booking - Create a booking
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  let rooms = getRooms();
  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const { numOfRooms } = req.body;

  // Validate the number of rooms
  if (numOfRooms > 5 || numOfRooms < 1) {
    return res.status(400).json({
      success: false,
      message: "Number of rooms must be between 1 and 5"
    });
  }

  // Validate available rooms
  const availableRooms = getAllAvailableRooms(rooms);
  if (availableRooms.length < numOfRooms) {
    return res.status(400).json({
      success: false,
      message: `Only ${availableRooms.length} rooms are available`
    });
  }

  // Find floors with enough available rooms
  const floorsWithAvailableRooms = getFloorsWithAvailableRooms(rooms, numOfRooms);
  
  if (floorsWithAvailableRooms.length > 0) {
    const result = findBestFloor(rooms, numOfRooms);
    
    if (result) {
      const { bestFloor, bestRoomsNumbers } = result;
      
      for (let i = 0; i < numOfRooms; i++) {
        rooms[bestFloor][bestRoomsNumbers[i] - 1].occupied.status = true;
        rooms[bestFloor][bestRoomsNumbers[i] - 1].occupied.bookedBy = clientIp;
      }

      setRooms(rooms);
      return res.status(200).json({
        success: true,
        message: `Rooms booked successfully`,
        data: rooms
      });
    }
  }

  // Cross-floor booking
  const crossFloorResult = selectRoomsAcrossFloors(rooms, numOfRooms);
  if (crossFloorResult && crossFloorResult.bestRooms) {
    const { bestRooms, bestTime } = crossFloorResult;
    for (let i = 0; i < numOfRooms; i++) {
      rooms[bestRooms[i].floor][bestRooms[i].rno - 1].occupied.status = true;
      rooms[bestRooms[i].floor][bestRooms[i].rno - 1].occupied.bookedBy = clientIp;
    }
    setRooms(rooms);
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
