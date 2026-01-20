const express = require('express');
const app = express();
const port = 5000 || process.env.PORT;
const bookingRoutes = require('./routes/booking');

app.use(express.json()); 

app.use('/booking', bookingRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});