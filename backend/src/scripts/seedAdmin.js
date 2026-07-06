require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const ADMIN_NAME = 'Vuthhh';
const ADMIN_EMAIL = 'ravuthkry129@gmail.com';
const ADMIN_PASSWORD = 'vuth123';

const MONGO_URI =
  'mongodb+srv://krysaravuth25_db_user:vuth123%3F%3F@cluster0.sihb0xt.mongodb.net/cambo_rent?appName=Cluster0&compressors=zlib';

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
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Remove existing admin with the same email if any
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
    console.log('🎉 Admin user created successfully!');
    console.log('──────────────────────────────────');
    console.log(`   Name  : ${admin.name}`);
    console.log(`   Email : ${admin.email}`);
    console.log(`   Role  : ${admin.role}`);
    console.log(`   ID    : ${admin._id}`);
    console.log('──────────────────────────────────');
    console.log('You can now log in with those credentials.');
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedAdmin();
