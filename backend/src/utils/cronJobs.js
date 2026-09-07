const cron = require('node-cron');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');

const startCronJobs = () => {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('[CRON] Running vehicle availability check...');
      const now = new Date();

      // 1. Find bookings that have ended and mark them as completed + make vehicle available
      const expiredBookings = await Booking.find({
        status: 'confirmed',
        endDate: { $lte: now }
      });

      for (const booking of expiredBookings) {
        booking.status = 'completed';
        await booking.save();
        await Vehicle.findByIdAndUpdate(booking.vehicleId, { available: true });
        console.log(`[CRON] Booking ${booking._id} completed, Vehicle ${booking.vehicleId} now available.`);
      }

      // 2. Find confirmed bookings that have started and make vehicle unavailable
      const activeBookings = await Booking.find({
        status: 'confirmed',
        startDate: { $lte: now },
        endDate: { $gt: now }
      });

      for (const booking of activeBookings) {
        await Vehicle.findByIdAndUpdate(booking.vehicleId, { available: false });
      }

      console.log('[CRON] Vehicle availability check finished.');
    } catch (err) {
      console.error('[CRON] Error running vehicle availability check:', err);
    }
  });
};

module.exports = startCronJobs;
