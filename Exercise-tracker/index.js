const express = require('express')
const bodyParser = require('body-parser');
const app = express()
const cors = require('cors')
require('dotenv').config({ path : "sample.env" });
const mongoose = require('mongoose');
const { Schema } = mongoose;

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect("Database Url");

// Define User model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }
});

const User = mongoose.model('User', userSchema);

// Define Exercise model
const exerciseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const Exercise = mongoose.model('Exercise', exerciseSchema);

// 1. Create a new user
app.post('/api/users', async (req, res) => {
  const { username } = req.body;
  const newUser = new User({ username });

  try {
    const savedUser = await newUser.save();
    res.json({ username: savedUser.username, _id: savedUser._id });
  } catch (err) {
    res.status(400).json({ error: 'Username already exists.' });
  }
});

// 2. Get a list of all users
app.get('/api/users', async (req, res) => {
  const users = await User.find({}, { username: 1 });
  res.json(users);
});

// 3. Add an exercise for a user
app.post('/api/users/:_id/exercises', async (req, res) => {
  const { description, duration, date } = req.body;
  const userId = req.params._id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const exercise = new Exercise({
      userId: user._id,
      description,
      duration,
      date: date ? new Date(date) : new Date()
    });

    const savedExercise = await exercise.save();

    res.json({
      username: user.username,
      _id: user._id,
      description: savedExercise.description,
      duration: savedExercise.duration,
      date: savedExercise.date.toDateString() // Send date as a string in the Date API format
    });
  } catch (err) {
    res.status(400).json({ error: 'Error adding exercise.' });
  }
});

// 4. Get user's exercise log
app.get('/api/users/:_id/logs', async (req, res) => {
  const { from, to, limit } = req.query;
  const userId = req.params._id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    let logs = await Exercise.find({ userId: user._id });

    logs = logs.map(ex => ({
      description: ex.description,
      duration: ex.duration,
      date: ex.date.toDateString()
    }));

    // Filtering by from and to dates
    if (from || to) {
      const fromDate = from ? new Date(from) : new Date(0);
      const toDate = to ? new Date(to) : new Date();

      logs = logs.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= fromDate && logDate <= toDate;
      });
    }

    // Limit the results
    if (limit) {
      logs = logs.slice(0, parseInt(limit));
    }

    res.json({
      username: user.username,
      count: logs.length,
      log: logs
    });
  } catch (err) {
    res.status(400).json({ error: 'Error fetching logs.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
