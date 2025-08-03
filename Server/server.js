require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./DBconn');
const app = express();
const mongoose = require('mongoose');
const PORT = process.env.PORT || 3000;

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// server.js

// allow your front-end origin
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
  methods: ['GET','POST','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false // set true only if you use cookies/auth
}));

app.use(express.static('Clients'));

// connecting to the database
connectDB();

const memoryGameRoutes = require('./Routes/memoryGameRoute');
app.use('/api/memory-game', memoryGameRoutes);

const reactionTimeRoutes = require('./Routes/reactionTimeRoute');
app.use('/api/reaction-time', reactionTimeRoutes);

const deepDiveGameRoutes = require('./Routes/deepDiveGameRoute');
app.use('/api/deep-dive-game', deepDiveGameRoutes);

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
});