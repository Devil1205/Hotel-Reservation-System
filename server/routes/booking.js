const express = require('express');
const router = express.Router();
const { createBooking, getRooms, resetBookings, randomBooking } = require('../controllers/booking');

router.get('/rooms', getRooms);
router.post('/', createBooking);
router.post('/reset', resetBookings);
router.post('/random', randomBooking);

module.exports = router;