require('dotenv').config({ path: '../process.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

// User Schema (matching your server/src/models/User.js)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  username: { type: String, unique: true, sparse: true },
  passwordHash: { type: String },
  webPassword: { type: String },
  roles: { type: [String], default: ['user'] },
  permissions: { type: [String], default: [] },
  tenantId: { type: String, default: 'default' },
  features: { type: Object, default: {} },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createUser() {
  try {
    console.log('Connecting to MongoDB...');

    // Check if user already exists and delete it to recreate with correct schema
    const existingUser = await User.findOne({ email: '22konopelskialexande@gmail.com' });

    if (existingUser) {
      console.log('User already exists. Deleting to recreate with correct schema...');
      await User.deleteOne({ email: '22konopelskialexande@gmail.com' });
      console.log('Old user deleted.');
    }

    // Hash the password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash('Alex998863-_', 10);

    // Create the user
    console.log('Creating user...');
    const user = new User({
      email: '22konopelskialexande@gmail.com',
      passwordHash: hashedPassword,
      roles: ['admin', 'user'], // Setting as admin
    });

    await user.save();
    console.log('✅ User created successfully!');
    console.log('Email:', user.email);
    console.log('Roles:', user.roles);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating user:', error);
    process.exit(1);
  }
}

// Wait for connection
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  createUser();
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
