const cron = require('node-cron');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

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
        await Booking.updateOne({ _id: booking._id }, { $set: { status: 'completed' } });
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

      // 3. Find no-show bookings (confirmed, but not picked up, 2 hours past start time)
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      const noShowBookings = await Booking.find({
        status: 'confirmed',
        startDate: { $lte: twoHoursAgo },
        paymentStatus: 'unpaid'
      });

      for (const booking of noShowBookings) {
        await Booking.updateOne(
          { _id: booking._id },
          { $set: { 
              status: 'cancelled', 
              notes: (booking.notes ? booking.notes + '\n' : '') + 'Automatically cancelled due to no-show.' 
            } 
          }
        );
        
        await Vehicle.findByIdAndUpdate(booking.vehicleId, { available: true });

        const user = await User.findById(booking.userId);
        if (user) {
          const newStrikes = (user.strikes || 0) + 1;
          const update = { strikes: newStrikes };
          if (newStrikes >= 3) {
            update.isActive = false;
            console.log(`[CRON] User ${user._id} banned due to 3 strikes.`);
          }
          await User.updateOne({ _id: user._id }, { $set: update });
        }
        console.log(`[CRON] Booking ${booking._id} cancelled for no-show. User ${user ? user._id : 'unknown'} penalized.`);
      }

      // 4. Find pending bookings that are 2 days past their start date (abandoned)
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      const abandonedPendingBookings = await Booking.find({
        status: { $in: ['pending', 'pending_approval'] },
        startDate: { $lte: twoDaysAgo },
        paymentStatus: 'unpaid'
      });

      for (const booking of abandonedPendingBookings) {
        await Booking.updateOne(
          { _id: booking._id },
          { $set: { 
              status: 'cancelled', 
              notes: (booking.notes ? booking.notes + '\n' : '') + 'Automatically cancelled because it was not picked up and paid within 2 days of start date.' 
            } 
          }
        );
        console.log(`[CRON] Pending Booking ${booking._id} cancelled automatically after 2 days.`);
      }

      console.log('[CRON] Vehicle availability check finished.');
    } catch (err) {
      console.error('[CRON] Error running vehicle availability check:', err);
    }
  });
};

module.exports = startCronJobs;
