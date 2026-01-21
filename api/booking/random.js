import { getRooms, setRooms } from '../_shared/state.js';

// POST /api/booking/random - Create random bookings
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
  
  setRooms(rooms);
  
  return res.status(200).json({
    success: true,
    message: `Randomly booked ${numToBook} rooms`,
    data: rooms
  });
}
