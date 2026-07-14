require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load env from project root
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@camborent.com').trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },
    phone: { type: String, default: '' },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    avatar: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

async function seedAdmin() {
  if (!process.env.MONGO_URI) {
    console.error(' MONGO_URI not set. Check your .env file.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(' Connected to MongoDB');

    await User.deleteOne({ email: ADMIN_EMAIL });

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    const admin = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      passwordHash,
      role: 'admin',
      isActive: true,
    });

    console.log('');
    console.log(' Admin user created successfully!');
    console.log('──────────────────────────────────');
    console.log(`   Name  : ${admin.name}`);
    console.log(`   Email : ${admin.email}`);
    console.log(`   Role  : ${admin.role}`);
    console.log(`   ID    : ${admin._id}`);
    console.log('──────────────────────────────────');
    console.log('You can now log in with those credentials.');
  } catch (err) {
    console.error(' Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedAdmin();
