const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const DB_URI = process.env.DATABASE_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

module.exports = connectDB;