import { getRooms, setRooms } from '../_shared/state.js';

// POST /api/booking/reset - Reset all bookings
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
  
  // Reset all rooms to unoccupied
  rooms = rooms.map(floor => 
    floor.map(room => ({
      ...room,
      occupied: { status: false, bookedBy: null }
    }))
  );
  
  setRooms(rooms);
  
  return res.status(200).json({
    success: true,
    message: 'All bookings have been reset',
    data: rooms
  });
}
