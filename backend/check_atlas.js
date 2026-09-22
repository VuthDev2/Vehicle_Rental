const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://krysaravuth25_db_user:Lw29OCryNxbbvpc5@cluster0.sihb0xt.mongodb.net/cambo_rent?appName=Cluster0&compressors=zlib')
.then(async () => {
    const Booking = mongoose.model('Booking', new mongoose.Schema({}, { strict: false }));
    const Vehicle = mongoose.model('Vehicle', new mongoose.Schema({}, { strict: false }));
    const bookings = await Booking.find({ status: 'cancelled' }).lean();
    console.log("Cancelled bookings count:", bookings.length);
    for (let b of bookings) {
        console.log("Booking ID:", b._id, "Vehicle ID:", b.vehicleId);
        const v = await Vehicle.findById(b.vehicleId);
        console.log("Vehicle found:", v ? v.name : "null");
    }
    process.exit(0);
}).catch(console.error);
