const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/vehicle_rental_db') // assuming default
.then(async () => {
    const Booking = mongoose.model('Booking', new mongoose.Schema({}, { strict: false }));
    const bookings = await Booking.find({ status: 'cancelled' }).lean();
    console.log("Cancelled bookings vehicle IDs:", bookings.map(b => b.vehicleId));
    process.exit(0);
}).catch(console.error);
