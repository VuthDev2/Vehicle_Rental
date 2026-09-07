const Vehicle = require('../models/Vehicle');
const path = require('path');
const fs = require('fs');
const { redisClient } = require('../config/redis');

// Escape user-supplied strings before using them in a MongoDB $regex to prevent ReDoS.
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

class VehicleService {
  async getVehicleStats() {
    const [totalVehicles, availableVehicles, typeCounts] = await Promise.all([
      Vehicle.countDocuments(),
      Vehicle.countDocuments({ available: true }),
      Vehicle.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
    ]);

    const counts = {};
    typeCounts.forEach((t) => (counts[t._id || 'Other'] = t.count));

    return { totalVehicles, availableVehicles, typeCounts: counts };
  }

  async getVehicles(queryObj) {
    const { query, type, fuel, transmission, location, minPrice, maxPrice, available, sort } = queryObj;

    const filter = {};

    if (query) {
      const safe = escapeRegex(query);
      filter.$or = [
        { name: { $regex: safe, $options: 'i' } },
        { brand: { $regex: safe, $options: 'i' } },
        { model: { $regex: safe, $options: 'i' } },
        { location: { $regex: safe, $options: 'i' } },
      ];
    }
    if (type) filter.type = { $in: type.split(',') };
    if (fuel) filter.fuel = fuel;
    if (transmission) filter.transmission = transmission;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (available === 'true') filter.available = true;
    if (minPrice) filter['pricing.day'] = { $gte: Number(minPrice) };
    if (maxPrice) filter['pricing.day'] = { ...filter['pricing.day'], $lte: Number(maxPrice) };

    let sortQuery = { createdAt: -1 };
    if (sort === 'price_asc') sortQuery = { 'pricing.day': 1 };
    if (sort === 'price_desc') sortQuery = { 'pricing.day': -1 };
    if (sort === 'rating') sortQuery = { rating: -1 };
    if (sort === 'trips') sortQuery = { trips: -1 };

    const page = parseInt(queryObj.page) || 1;
    const limit = parseInt(queryObj.limit) || 12;
    const skip = (page - 1) * limit;

    const cacheKey = `vehicles:${JSON.stringify(queryObj)}`;

    // Check Cache
    if (redisClient.isOpen) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const [vehicles, total] = await Promise.all([
      Vehicle.find(filter).sort(sortQuery).skip(skip).limit(limit),
      Vehicle.countDocuments(filter),
    ]);

    const responseData = { vehicles, total, page, totalPages: Math.ceil(total / limit) };

    // Save to Cache for 5 minutes
    if (redisClient.isOpen) {
      await redisClient.setEx(cacheKey, 300, JSON.stringify(responseData));
    }

    return responseData;
  }

  async getVehicleById(id) {
    return await Vehicle.findById(id);
  }

  async createVehicle(data) {
    const vehicle = await Vehicle.create({
      ...data,
      available: data.available !== undefined ? data.available : true,
    });
    await this._invalidateCache();
    return vehicle;
  }

  async updateVehicle(id, updates) {
    const vehicle = await Vehicle.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (vehicle) {
      await this._invalidateCache();
    }
    return vehicle;
  }

  async deleteVehicle(id) {
    const vehicle = await Vehicle.findByIdAndDelete(id);
    if (vehicle) {
      await this._invalidateCache();
    }
    return vehicle;
  }

  async addImages(id, files) {
    const imageUrls = files.map((f) => `/uploads/${f.filename}`);
    const vehicle = await Vehicle.findByIdAndUpdate(
      id,
      { $push: { images: { $each: imageUrls } } },
      { new: true }
    );
    return { vehicle, imageUrls };
  }

  async deleteImage(id, index) {
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) return null;

    if (isNaN(index) || index < 0 || index >= vehicle.images.length) {
      throw new Error('Invalid image index.');
    }

    const imageUrl = vehicle.images[index];
    vehicle.images.splice(index, 1);
    await vehicle.save();

    // Delete physical file
    const filename = path.basename(imageUrl);
    const filepath = path.join(__dirname, '../../uploads', filename);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);

    return vehicle;
  }

  async _invalidateCache() {
    if (redisClient.isOpen) {
      const keys = await redisClient.keys('vehicles:*');
      if (keys.length > 0) await redisClient.del(keys);
    }
  }
}

module.exports = new VehicleService();
